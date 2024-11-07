from flask import Blueprint
from services.request_handler import handle_auction_service_request, handle_bidder_service_request

ping_with_errors_blueprint = Blueprint('ping-with-errors', __name__)

@ping_with_errors_blueprint.route('/auction', methods=['GET'])
def ping_auction_service():
    return handle_auction_service_request('GET', '/ping-with-errors', variant=1)

@ping_with_errors_blueprint.route('/bidder', methods=['GET'])
def ping_bidder_service():
    return handle_bidder_service_request('GET', '/ping-with-errors', variant=2)