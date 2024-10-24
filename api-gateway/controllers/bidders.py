from flask import Blueprint, request, jsonify
from services.request_handler import handle_request, get_least_loaded_service
from store.replicas import bidder_service_replicas
import requests

bidders_blueprint = Blueprint('bidders', __name__)

@bidders_blueprint.route('/', methods=['POST'])
def create_bidder():
    data = request.json
    return handle_request('POST', '/bidders', data, variant=2)

@bidders_blueprint.route('/', methods=['GET'])
def get_all_bidders():
    return handle_request('GET', '/bidders', variant=2)

@bidders_blueprint.route('/<int:id>', methods=['GET'])
def get_bidder(id):
    return handle_request('GET', f'/bidders/{id}', variant=2)

@bidders_blueprint.route('/<int:id>/bids', methods=['GET'])
def get_bids_by_bidder(id):
    return handle_request('GET', f'/bidders/{id}/bids', variant=2)

@bidders_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bidder(id):
    data = request.json
    return handle_request('PATCH', f'/bidders/{id}', data, variant=2)

@bidders_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bidder(id):
    return handle_request('DELETE', f'/bidders/{id}', variant=2)

@bidders_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    return handle_request('GET', '/timeout', variant=2)

@bidders_blueprint.route('/simulate-load', methods=['GET'])
def ping_bidder_service():

    selected_service = get_least_loaded_service(bidder_service_replicas)
        
    if not selected_service:
        return jsonify({'error': 'No available services to handle the request'}), 503
    
    response = requests.get(selected_service['url'] + '/timeout', timeout=10)

    return jsonify(response.json()), response.status_code