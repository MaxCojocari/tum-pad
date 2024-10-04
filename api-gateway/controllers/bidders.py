from flask import Blueprint, request, jsonify
import requests
from requests.exceptions import Timeout, RequestException
from services.service_urls import BIDDERS_SERVICE_URL

bidders_blueprint = Blueprint('bidders', __name__)

# global timeout value in seconds
TIMEOUT = 4

@bidders_blueprint.route('/', methods=['POST'])
def create_bidder():
    try:
        data = request.json
        response = requests.post(f'{BIDDERS_SERVICE_URL}/bidders', json=data, timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bidders_blueprint.route('/', methods=['GET'])
def get_all_bidders():
    try:
        response = requests.get(f'{BIDDERS_SERVICE_URL}/bidders', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bidders_blueprint.route('/<int:id>', methods=['GET'])
def get_bidder(id):
    try:
        response = requests.get(f'{BIDDERS_SERVICE_URL}/bidders/{id}', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bidders_blueprint.route('/<int:id>/bids', methods=['GET'])
def get_bids_by_bidder(id):
    try:
        response = requests.get(f'{BIDDERS_SERVICE_URL}/bidders/{id}/bids', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bidders_blueprint.route('/<int:id>', methods=['PATCH'])
def update_bidder(id):
    try:  
        data = request.json
        response = requests.patch(f'{BIDDERS_SERVICE_URL}/bidders/{id}', json=data, timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bidders_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_bidder(id):
    try:
        response = requests.delete(f'{BIDDERS_SERVICE_URL}/bidders/{id}', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500

@bidders_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    try:
        response = requests.get(f'{BIDDERS_SERVICE_URL}/timeout', timeout=TIMEOUT)
        return jsonify(response.json()), response.status_code
    except Timeout:
        return jsonify({'error': 'Request to auction service timed out'}), 504
    except RequestException as e:
        return jsonify({'error': str(e)}), 500