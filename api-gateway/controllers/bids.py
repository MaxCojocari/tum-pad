from flask import Blueprint, request
from services.request_handler import handle_bidder_service_request

bids_blueprint = Blueprint('bids', __name__)

@bids_blueprint.route('/', methods=['POST'])
def create_bid():
    data = request.json
    return handle_bidder_service_request('POST', '/bids', data, variant=2)

@bids_blueprint.route('/', methods=['GET'])
def get_all_bids():
    return handle_bidder_service_request('GET', '/bids', variant=2)

@bids_blueprint.route('/<int:id>', methods=['GET'])
def get_bid(id):
    return handle_bidder_service_request('GET', f'/bids/{id}', variant=2)

@bids_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bid(id):
    data = request.json
    return handle_bidder_service_request('PATCH', f'/bids/{id}', data, variant=2)

@bids_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bid(id):
    return handle_bidder_service_request('DELETE', f'/bids/{id}', variant=2)

@bids_blueprint.route('/lobbies', methods=['GET'])
def get_all_lobbies():
    return handle_bidder_service_request('GET', '/lobbies', variant=2)