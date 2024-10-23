from flask import Blueprint, request
from services.request_handler import handle_request

bids_blueprint = Blueprint('bids', __name__)

@bids_blueprint.route('/', methods=['POST'])
def create_bid():
    data = request.json
    return handle_request('POST', '/bids', data)

@bids_blueprint.route('/', methods=['GET'])
def get_all_bids():
    return handle_request('GET', '/bids')

@bids_blueprint.route('/<int:id>', methods=['GET'])
def get_bid(id):
    return handle_request('GET', f'/bids/{id}')

@bids_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bid(id):
    data = request.json
    return handle_request('PATCH', f'/bids/{id}', data)

@bids_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bid(id):
    return handle_request('DELETE', f'/bids/{id}')

@bids_blueprint.route('/lobbies', methods=['GET'])
def get_all_lobbies():
    return handle_request('GET', '/lobbies')