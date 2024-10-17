from flask import Blueprint, request, jsonify
import requests
from requests.exceptions import Timeout, RequestException
from services.service_urls import BIDDERS_SERVICE_URL
from config.configuration import TIMEOUT

bidders_blueprint = Blueprint('bidders', __name__)


def handle_request(method, url, data=None):
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

@bidders_blueprint.route('/', methods=['POST'])
def create_bidder():
    data = request.json
    return handle_request('POST', f'{BIDDERS_SERVICE_URL}/bidders', data)

@bidders_blueprint.route('/', methods=['GET'])
def get_all_bidders():
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/bidders')

@bidders_blueprint.route('/<int:id>', methods=['GET'])
def get_bidder(id):
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/bidders/{id}')

@bidders_blueprint.route('/<int:id>/bids', methods=['GET'])
def get_bids_by_bidder(id):
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/bidders/{id}/bids')

@bidders_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bidder(id):
    data = request.json
    return handle_request('PATCH', f'{BIDDERS_SERVICE_URL}/bidders/{id}', data)

@bidders_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bidder(id):
    return handle_request('DELETE', f'{BIDDERS_SERVICE_URL}/bidders/{id}')

@bidders_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    return handle_request('GET', f'{BIDDERS_SERVICE_URL}/timeout')
