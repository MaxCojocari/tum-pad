from flask import jsonify
import requests
from requests.exceptions import Timeout, RequestException
from config.configuration import TIMEOUT

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