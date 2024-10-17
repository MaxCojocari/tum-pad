from flask import Blueprint, jsonify
import requests
from requests.exceptions import Timeout, RequestException
from services.service_urls import BIDDERS_SERVICE_URL
from config.configuration import TIMEOUT

lobbies_blueprint = Blueprint('lobbies', __name__)

def handle_request(method, url, data=None):
    """Helper function to handle HTTP requests."""
    try:
        if method == 'GET':
            response = requests.get(url, timeout=TIMEOUT)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=TIMEOUT)
        elif method == 'PATCH':
            response = requests.patch(url, json=data, timeout=TIMEOUT)
        elif method == 'DELETE':
            response = requests.delete(url, timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to bidder service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@lobbies_blueprint.route('/', methods=['GET'])
def get_all_lobbies():
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/lobbies')