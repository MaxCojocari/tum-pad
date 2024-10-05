from flask import Blueprint, request, jsonify
import requests
from requests.exceptions import Timeout, RequestException
from services.service_urls import BIDDERS_SERVICE_URL

bids_blueprint = Blueprint('bids', __name__)

# Global timeout value in seconds
TIMEOUT = 6

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

@bids_blueprint.route('/', methods=['POST'])
def create_bid():
    data = request.json
    return handle_request('POST', f'{BIDDERS_SERVICE_URL}/bids', data)

@bids_blueprint.route('/', methods=['GET'])
def get_all_bids():
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/bids')

@bids_blueprint.route('/<int:id>', methods=['GET'])
def get_bid(id):
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/bids/{id}')

@bids_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bid(id):
    data = request.json
    return handle_request('PATCH', f'{BIDDERS_SERVICE_URL}/bids/{id}', data)

@bids_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bid(id):
    return handle_request('DELETE', f'{BIDDERS_SERVICE_URL}/bids/{id}')

