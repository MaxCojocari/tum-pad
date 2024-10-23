from flask import Blueprint, request
from utils.handle_request import handle_request
from services.service_urls import AUCTIONS_SERVICE_URL

ping_blueprint = Blueprint('ping', __name__)

@ping_blueprint.route('/auction', methods=['GET'])
def ping_auction():
    return handle_request('GET', '/ping', variant=1)

@ping_blueprint.route('/bidder', methods=['GET'])
def ping_auction():
    return handle_request('GET', '/ping', variant=2)