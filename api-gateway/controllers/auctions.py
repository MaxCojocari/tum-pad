from flask import Blueprint, request
from utils.handle_request import handle_request
from services.service_urls import AUCTIONS_SERVICE_URL

auctions_blueprint = Blueprint('auctions', __name__)

@auctions_blueprint.route('/', methods=['POST'])
def create_auction():
    data = request.json
    return handle_request('POST', f'{AUCTIONS_SERVICE_URL}/auctions', data)

@auctions_blueprint.route('/', methods=['GET'])
def get_all_auctions():
    return handle_request('GET', f'{AUCTIONS_SERVICE_URL}/auctions')

@auctions_blueprint.route('/<int:id>', methods=['GET'])
def get_auction(id):
    return handle_request('GET', f'{AUCTIONS_SERVICE_URL}/auctions/{id}')

@auctions_blueprint.route('/<int:id>', methods=['PATCH'])
def update_auction(id):
    data = request.json
    return handle_request('PATCH', f'{AUCTIONS_SERVICE_URL}/auctions/{id}', data)

@auctions_blueprint.route('/<int:id>/close', methods=['POST'])
def close_auction(id):
    return handle_request('POST', f'{AUCTIONS_SERVICE_URL}/auctions/{id}/close')

@auctions_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_auction(id):
    return handle_request('DELETE', f'{AUCTIONS_SERVICE_URL}/auctions/{id}')

@auctions_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    return handle_request('GET', f'{AUCTIONS_SERVICE_URL}/timeout')
