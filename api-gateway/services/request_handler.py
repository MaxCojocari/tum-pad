import requests
from requests.exceptions import Timeout, RequestException
import pybreaker
from flask import jsonify
from config.configuration import TIMEOUT
from store.replicas import *

# Define the service replicas and their current state (load for Variant 2)
# service_replicas = [
#     {'url': 'http://service-replica-1:5000', 'load': 0, 'active': True},
#     {'url': 'http://service-replica-2:5000', 'load': 0, 'active': True},
#     {'url': 'http://service-replica-3:5000', 'load': 0, 'active': True},
#     {'url': 'http://service-replica-4:5000', 'load': 0, 'active': True}
# ]

breaker = pybreaker.CircuitBreaker(fail_max=3, reset_timeout=TIMEOUT * 3.5)

current_replica_index = -1

def get_round_robin_service(service_replicas):
    global current_replica_index
    current_replica_index = (current_replica_index + 1) % len(service_replicas)
    return service_replicas[current_replica_index]

def get_least_loaded_service(service_replicas):
    if not service_replicas:
        return None
    return min(service_replicas, key=lambda service: service['load'])

def handle_request(method, route, data=None, variant=1):
    """
    Handle HTTP requests with flexible Load Balancing and Circuit Breaker logic.
    """
    if variant == 1:
        selected_service = get_round_robin_service(auction_service_replicas)
    elif variant == 2:
        selected_service = get_least_loaded_service(bidder_service_replicas)
        
    if not selected_service:
        return jsonify({'error': 'No available services to handle the request'}), 503

    service_url = selected_service['url']

    try:
        if variant == 2:
            selected_service['load'] += 1

        if method == 'GET':
            response = breaker.call(requests.get, service_url + route, timeout=TIMEOUT)
        elif method == 'POST':
            response = breaker.call(requests.post, service_url + route, json=data, timeout=TIMEOUT)
        elif method == 'PATCH':
            response = breaker.call(requests.patch, service_url + route, json=data, timeout=TIMEOUT)
        elif method == 'DELETE':
            response = breaker.call(requests.delete, service_url + route, timeout=TIMEOUT)

        if variant == 2:
            selected_service['load'] -= 1

        return jsonify(response.json()), response.status_code

    except pybreaker.CircuitBreakerError:
        if variant == 2:
            selected_service['active'] = False
        return jsonify({'error': 'Circuit breaker is open. Service temporarily unavailable.'}), 503
    except Timeout:
        if variant == 2:
            selected_service['load'] -= 1
        return jsonify({'error': 'Request to service timed out'}), 504
    except RequestException as e:
        if variant == 2:
            selected_service['load'] -= 1
        return jsonify({'error': str(e)}), 500