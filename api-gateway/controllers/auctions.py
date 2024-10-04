from flask import Blueprint, request, jsonify
import requests
from requests.exceptions import Timeout, RequestException
from services.service_urls import AUCTIONS_SERVICE_URL

auctions_blueprint = Blueprint('auctions', __name__)

# global timeout value in seconds
TIMEOUT = 5

@auctions_blueprint.route('/', methods=['POST'])
def create_auction():
    data = request.json
    try:
        response = requests.post(f'{AUCTIONS_SERVICE_URL}/auctions', json=data, timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@auctions_blueprint.route('/', methods=['GET'])
def get_all_auctions():
    try:
        response = requests.get(f'{AUCTIONS_SERVICE_URL}/auctions', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@auctions_blueprint.route('/<int:id>', methods=['GET'])
def get_auction(id):
    try:
        response = requests.get(f'{AUCTIONS_SERVICE_URL}/auctions/{id}', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@auctions_blueprint.route('/<int:id>', methods=['PATCH'])
def update_auction(id):
    try:
        data = request.json
        response = requests.patch(f'{AUCTIONS_SERVICE_URL}/auctions/{id}', json=data, timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@auctions_blueprint.route('/<int:id>/close', methods=['POST'])
def close_auction(id):
    try:
        response = requests.post(f'{AUCTIONS_SERVICE_URL}/auctions/{id}/close', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@auctions_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_auction(id):
    try:
        response = requests.delete(f'{AUCTIONS_SERVICE_URL}/auctions/{id}', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@auctions_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    try:
        response = requests.get(f'{AUCTIONS_SERVICE_URL}/timeout', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500