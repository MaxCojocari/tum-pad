from flask import Blueprint, request, jsonify
import requests
from requests.exceptions import Timeout, RequestException
from services.service_urls import BIDDERS_SERVICE_URL

bids_blueprint = Blueprint('bids', __name__)

# global timeout value in seconds
TIMEOUT = 6

@bids_blueprint.route('/', methods=['POST'])
def create_bid():
    try:
        data = request.json
        response = requests.post(f'{BIDDERS_SERVICE_URL}/bids', json=data, timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to bidder service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bids_blueprint.route('/', methods=['GET'])
def get_all_bids():
    try:
        response = requests.get(f'{BIDDERS_SERVICE_URL}/bids', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to bidder service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bids_blueprint.route('/<int:id>', methods=['GET'])
def get_bid(id):
    try:
        response = requests.get(f'{BIDDERS_SERVICE_URL}/bids/{id}', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to bidder service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bids_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bid(id):
    try:
        data = request.json
        response = requests.patch(f'{BIDDERS_SERVICE_URL}/bids/{id}', json=data, timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to bidder service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bids_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bid(id):
    try:
        response = requests.delete(f'{BIDDERS_SERVICE_URL}/bids/{id}', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to bidder service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500
