from flask import Blueprint
from services.request_handler import handle_bidder_service_request

lobbies_blueprint = Blueprint('lobbies', __name__)

@lobbies_blueprint.route('/', methods=['GET'])
def get_all_lobbies():
    return handle_bidder_service_request('GET', '/lobbies', variant=2)