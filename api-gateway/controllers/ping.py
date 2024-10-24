from flask import Blueprint, request
from services.request_handler import handle_request

ping_blueprint = Blueprint('ping', __name__)

@ping_blueprint.route('/auction', methods=['GET'])
def ping_auction_service():
    load_balancer = request.args.get('load_balancer', 'round_robin')
    return handle_request('GET', '/ping', variant=1, load_balancer=load_balancer)

@ping_blueprint.route('/bidder', methods=['GET'])
def ping_bidder_service():
    load_balancer = request.args.get('load_balancer', 'round_robin')
    return handle_request('GET', '/ping', variant=2, load_balancer=load_balancer)