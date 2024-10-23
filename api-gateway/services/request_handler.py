import time
import requests
from requests.exceptions import Timeout, RequestException
from flask import jsonify
from config.configuration import TIMEOUT, FAIL_MAX
from store.replicas import *
import pybreaker
from services.replicas_handler import remove_service_replica

breaker = pybreaker.CircuitBreaker(fail_max=FAIL_MAX, reset_timeout=10)

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

    service_url = selected_service['url'] + route

    try:
        selected_service['load'] += 1

        if method == 'GET':
            response = get(service_url, retry_attempts=FAIL_MAX, timeout=TIMEOUT)
        elif method == 'POST':
            response = post(service_url, json=data, retry_attempts=FAIL_MAX, timeout=TIMEOUT)
        elif method == 'PATCH':
            response = patch(service_url, json=data, retry_attempts=FAIL_MAX, timeout=TIMEOUT)
        elif method == 'DELETE':
            response = delete(service_url, retry_attempts=FAIL_MAX, timeout=TIMEOUT)
        
        selected_service['load'] -= 1

        return jsonify(response.json()), response.status_code

    except pybreaker.CircuitBreakerError:
        if variant == 2:
            remove_service_replica('bidder-service', service_url)
        return jsonify({'error': 'Circuit breaker is open. Service temporarily unavailable.'}), 503
    except Timeout:
        if variant == 2:
            selected_service['load'] -= 1
        return jsonify({'error': 'Request to service timed out'}), 504
    except RequestException as e:
        if variant == 2:
            selected_service['load'] -= 1
        return jsonify({'error': str(e)}), 500
  
@breaker  
def get(url, retry_attempts=3, timeout=TIMEOUT, retry_backoff=1):
    for attempt in range(retry_attempts):
        try:
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)
        
    breaker.open()
    raise pybreaker.CircuitBreakerError()

@breaker  
def post(url, data, retry_attempts=3, timeout=TIMEOUT, retry_backoff=1):
    for attempt in range(retry_attempts):
        try:
            response = requests.post(url, json=data, timeout=timeout)
            response.raise_for_status()
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)
        
    breaker.open()
    raise pybreaker.CircuitBreakerError()

@breaker  
def patch(url, data, retry_attempts=3, timeout=TIMEOUT, retry_backoff=1):
    for attempt in range(retry_attempts):
        try:
            response = requests.patch(url, json=data, timeout=TIMEOUT)
            response.raise_for_status()
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)
        
    breaker.open()
    raise pybreaker.CircuitBreakerError()

@breaker  
def delete(url, retry_attempts=3, timeout=TIMEOUT, retry_backoff=1):
    for attempt in range(retry_attempts):
        try:
            response = requests.delete(url, timeout=timeout)
            response.raise_for_status()
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)
        
    breaker.open()
    raise pybreaker.CircuitBreakerError()
    