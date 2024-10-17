from flask import Blueprint, request, jsonify
import requests
from requests.exceptions import Timeout, RequestException
from services.service_urls import AUCTIONS_SERVICE_URL
from config.configuration import TIMEOUT

auctions_blueprint = Blueprint('auctions', __name__)

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
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@auctions_blueprint.route('/', methods=['POST'])
def create_auction():
    data = request.json
    return handle_request('POST', f'{AUCTIONS_SERVICE_URL}/auctions', data)

@auctions_blueprint.route('/', methods=['GET'])
def get_all_auctions():
    return handle_request('GET', f'{AUCTIONS_SERVICE_URL}/auctions')

@auctions_blueprint.route('/<int:id>', methods=['GET'])
def get_auction(id):
    return handle_request('GET', f'{AUCTIONS_SERVICE_URL}/auctions/{id}')

@auctions_blueprint.route('/<int:id>', methods=['PATCH'])
def update_auction(id):
    data = request.json
    return handle_request('PATCH', f'{AUCTIONS_SERVICE_URL}/auctions/{id}', data)

@auctions_blueprint.route('/<int:id>/close', methods=['POST'])
def close_auction(id):
    return handle_request('POST', f'{AUCTIONS_SERVICE_URL}/auctions/{id}/close')

@auctions_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_auction(id):
    return handle_request('DELETE', f'{AUCTIONS_SERVICE_URL}/auctions/{id}')

@auctions_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    return handle_request('GET', f'{AUCTIONS_SERVICE_URL}/timeout')
