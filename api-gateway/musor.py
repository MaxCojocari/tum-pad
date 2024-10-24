import time
import requests
from requests.exceptions import Timeout, RequestException
import pybreaker
from flask import jsonify

# Configuration: timeout, retry attempts, backoff delay
REQ_TIMEOUT = 10  # Timeout for each request in seconds
RETRY_ATTEMPTS = 3  # Number of times to retry the request if it fails
BACKOFF_DELAY = 2  # Delay between retries (in seconds)
CRITICAL_THRESHOLD = 3  # Circuit breaker failure threshold

# Service replicas and load balancing
service_replicas = [
    {'url': 'http://localhost:3001', 'load': 0, 'active': True},
    {'url': 'http://localhost:3002', 'load': 0, 'active': True},
    {'url': 'http://localhost:3003', 'load': 0, 'active': True},
]

# Circuit breaker for both variants
breaker = pybreaker.CircuitBreaker(fail_max=CRITICAL_THRESHOLD, reset_timeout=REQ_TIMEOUT * 3.5)

# Function to get the next service in round-robin
current_replica_index = -1
def get_round_robin_service():
    global current_replica_index
    current_replica_index = (current_replica_index + 1) % len(service_replicas)
    return service_replicas[current_replica_index]

# Function to retry the request
def retry_request(request_func, service_url, retries=RETRY_ATTEMPTS, backoff=BACKOFF_DELAY, **kwargs):
    """Retries a failed request up to a specified number of times."""
    for attempt in range(retries):
        try:
            # Try making the request
            return request_func(service_url, **kwargs)
        except (Timeout, RequestException) as e:
            if attempt < retries - 1:  # Still have retries left
                print(f"Request failed, retrying... Attempt {attempt + 1}/{retries}")
                time.sleep(backoff)  # Wait before retrying
            else:
                # All retries have been exhausted
                raise e

def handle_request(method, url, data=None, variant='variant1'):
    """
    Handle HTTP requests with retry logic, load balancing, and circuit breaker.
    
    Args:
    - method: The HTTP method (GET, POST, etc.).
    - url: The endpoint to which the request should be made.
    - data: The data to be sent in the request (for POST, PATCH).
    - variant: Defines the load balancing and circuit breaker variant to use.
    """
    # Select the load balancing strategy
    selected_service = get_round_robin_service()  # Round robin for simplicity

    if not selected_service:
        return jsonify({'error': 'No available services to handle the request'}), 503

    service_url = selected_service['url'] + url

    try:
        # Retry logic: Call the service with retries, using the circuit breaker for protection
        if method == 'GET':
            response = breaker.call(retry_request, requests.get, service_url, retries=RETRY_ATTEMPTS, backoff=BACKOFF_DELAY, timeout=REQ_TIMEOUT)
        elif method == 'POST':
            response = breaker.call(retry_request, requests.post, service_url, json=data, retries=RETRY_ATTEMPTS, backoff=BACKOFF_DELAY, timeout=REQ_TIMEOUT)
        elif method == 'PATCH':
            response = breaker.call(retry_request, requests.patch, service_url, json=data, retries=RETRY_ATTEMPTS, backoff=BACKOFF_DELAY, timeout=REQ_TIMEOUT)
        elif method == 'DELETE':
            response = breaker.call(retry_request, requests.delete, service_url, retries=RETRY_ATTEMPTS, backoff=BACKOFF_DELAY, timeout=REQ_TIMEOUT)

        return jsonify(response.json()), response.status_code

    except pybreaker.CircuitBreakerError:
        # Circuit breaker is open
        print(f"Circuit breaker open for {service_url}")
        return jsonify({'error': 'Circuit breaker is open. Service temporarily unavailable.'}), 503
    except Timeout:
        # Timeout occurred after all retries
        return jsonify({'error': 'Request timed out after retries'}), 504
    except RequestException as e:
        # Handle any other request errors
        return jsonify({'error': str(e)}), 500


auction_service_replicas = [
    {"url": "http://localhost:3001"},
    {"url": "http://localhost:3002"}
]

bidder_service_replicas = [
    {"url": "http://localhost:4001"},
    {"url": "http://localhost:4002"}
]

replicas_info = [
    {'host': 'localhost', 'port': 4001},
    {'host': 'localhost', 'port': 4002}
]


from urllib.parse import urlparse

# Function to be tested
def remove_service_replica(service_name, url):
    parsed_url = urlparse(url)
    host = parsed_url.hostname
    port = parsed_url.port

    # Mocked Redis response for replicas info
    filtered_replicas_info = [info for info in replicas_info if info['host'] != host or info['port'] != port]
    print(filtered_replicas_info)

    global auction_service_replicas, bidder_service_replicas

    if service_name == 'auction-service':
        auction_service_replicas = [info for info in auction_service_replicas if info['url'] != url]
    elif service_name == 'bidder-service':
        bidder_service_replicas = [info for info in bidder_service_replicas if info['url'] != url]

    print('auction_service_replicas', auction_service_replicas)
    print('bidder_service_replicas', bidder_service_replicas)

if __name__ == "__main__":
    remove_service_replica('bidder-service', "http://localhost:4001")