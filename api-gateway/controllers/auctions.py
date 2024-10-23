from flask import Blueprint, request
from services.request_handler import handle_request

auctions_blueprint = Blueprint('auctions', __name__)

@auctions_blueprint.route('/', methods=['POST'])
def create_auction():
    data = request.json
    return handle_request('POST', '/auctions', data)

@auctions_blueprint.route('/', methods=['GET'])
def get_all_auctions():
    return handle_request('GET', '/auctions')

@auctions_blueprint.route('/<int:id>', methods=['GET'])
def get_auction(id):
    return handle_request('GET', f'/auctions/{id}')

@auctions_blueprint.route('/<int:id>', methods=['PATCH'])
def update_auction(id):
    data = request.json
    return handle_request('PATCH', f'/auctions/{id}', data)

@auctions_blueprint.route('/<int:id>/close', methods=['POST'])
def close_auction(id):
    return handle_request('POST', f'/auctions/{id}/close')

@auctions_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_auction(id):
    return handle_request('DELETE', f'/auctions/{id}')

@auctions_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    return handle_request('GET', '/timeout')
