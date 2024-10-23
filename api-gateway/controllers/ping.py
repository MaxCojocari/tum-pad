from flask import Blueprint
from services.request_handler import handle_request

ping_blueprint = Blueprint('ping', __name__)

@ping_blueprint.route('/auction', methods=['GET'])
def ping_auction_service():
    return handle_request('GET', '/ping', variant=1)

@ping_blueprint.route('/bidder', methods=['GET'])
def ping_bidder_service():
    return handle_request('GET', '/ping', variant=2)