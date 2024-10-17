from flask import Blueprint
from utils.handle_request import handle_request
from services.service_urls import BIDDERS_SERVICE_URL

lobbies_blueprint = Blueprint('lobbies', __name__)

@lobbies_blueprint.route('/', methods=['GET'])
def get_all_lobbies():
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/lobbies')