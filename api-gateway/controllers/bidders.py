from flask import Blueprint, request
from services.request_handler import handle_bidder_service_request

bidders_blueprint = Blueprint('bidders', __name__)

@bidders_blueprint.route('/', methods=['POST'])
def create_bidder():
    data = request.json
    return handle_bidder_service_request('POST', '/bidders', data, variant=2)

@bidders_blueprint.route('/', methods=['GET'])
def get_all_bidders():
    return handle_bidder_service_request('GET', '/bidders', variant=2)

@bidders_blueprint.route('/<int:id>', methods=['GET'])
def get_bidder(id):
    return handle_bidder_service_request('GET', f'/bidders/{id}', variant=2)

@bidders_blueprint.route('/<int:id>/bids', methods=['GET'])
def get_bids_by_bidder(id):
    return handle_bidder_service_request('GET', f'/bidders/{id}/bids', variant=2)

@bidders_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bidder(id):
    data = request.json
    return handle_bidder_service_request('PATCH', f'/bidders/{id}', data, variant=2)

@bidders_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bidder(id):
    return handle_bidder_service_request('DELETE', f'/bidders/{id}', variant=2)

@bidders_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    return handle_bidder_service_request('GET', '/timeout', variant=2)