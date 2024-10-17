from flask import Blueprint, request
from utils.handle_request import handle_request
from services.service_urls import BIDDERS_SERVICE_URL

bidders_blueprint = Blueprint('bidders', __name__)

@bidders_blueprint.route('/', methods=['POST'])
def create_bidder():
    data = request.json
    return handle_request('POST', f'{BIDDERS_SERVICE_URL}/bidders', data)

@bidders_blueprint.route('/', methods=['GET'])
def get_all_bidders():
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/bidders')

@bidders_blueprint.route('/<int:id>', methods=['GET'])
def get_bidder(id):
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/bidders/{id}')

@bidders_blueprint.route('/<int:id>/bids', methods=['GET'])
def get_bids_by_bidder(id):
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/bidders/{id}/bids')

@bidders_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bidder(id):
    data = request.json
    return handle_request('PATCH', f'{BIDDERS_SERVICE_URL}/bidders/{id}', data)

@bidders_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bidder(id):
    return handle_request('DELETE', f'{BIDDERS_SERVICE_URL}/bidders/{id}')

@bidders_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/timeout')
