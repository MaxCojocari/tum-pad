import time
import requests
from requests.exceptions import Timeout, RequestException
from flask import jsonify
from config.configuration import REQ_TIMEOUT, FAIL_MAX, MONITORING_TIME_INTERVAL, AUCTION_SERVICE_CRITICAL_LOAD, BIDDER_SERVICE_CRITICAL_LOAD
from store.replicas import *
import pybreaker
from services.replicas_handler import remove_service_replica
from services.redis_service import redis_client
from urllib.parse import urlparse

breaker = pybreaker.CircuitBreaker(fail_max=FAIL_MAX, reset_timeout=10)

current_replica_index = -1

def track_requests_over_interval(service_name, interval=MONITORING_TIME_INTERVAL):
    """
    Track the number of requests over an arbitrary interval (in seconds).
    """
    current_time = int(time.time())
    
    # Create a bucket for the time interval
    current_bucket = current_time // interval

    # Key to store the request count for the current time bucket
    redis_key = f"{service_name}_bucket_{current_bucket}"

    # Increment the request count for this bucket
    redis_client.incr(redis_key)
    
    # Set the expiration for this bucket to cover one interval plus a buffer (ex. 2 intervals)
    redis_client.expire(redis_key, interval * 2)

    # Sum up the request counts from all active buckets within the interval
    request_count = 0
    for i in range(current_bucket - (interval // MONITORING_TIME_INTERVAL), current_bucket + 1):
        bucket_key = f"{service_name}_bucket_{i}"
        request_count += int(redis_client.get(bucket_key) or 0)
    
    critical_load = AUCTION_SERVICE_CRITICAL_LOAD if service_name == 'auction-service' else BIDDER_SERVICE_CRITICAL_LOAD
    
    if request_count > critical_load:
        print(f"ALERT: Critical load reached for {service_name}: {request_count} requests in the last {MONITORING_TIME_INTERVAL} seconds!")

def inc_req_replica(url):
    parsed_url = urlparse(url)
    host = parsed_url.hostname
    port = parsed_url.port
    redis_key = f"{host}_{port}_load"
    redis_client.incr(redis_key)

def dec_req_replica(url):
    parsed_url = urlparse(url)
    host = parsed_url.hostname
    port = parsed_url.port
    redis_key = f"{host}_{port}_load"
    redis_client.decr(redis_key)

def get_round_robin_service(service_replicas):
    global current_replica_index
    current_replica_index = (current_replica_index + 1) % len(service_replicas)
    return {"url": service_replicas[current_replica_index]}

def get_least_loaded_service(service_replicas):
    if not service_replicas:
        return None
    
    replica_info = []
    
    for url in service_replicas:
        parsed_url = urlparse(url)
        host = parsed_url.hostname
        port = parsed_url.port
        redis_key = f"{host}_{port}_load"
        load = redis_client.get(redis_key) or 0
        replica_info.append({
            "url": f"http://{host}:{port}",
            "load": int(load)
        })
    
    return min(replica_info, key=lambda service: service['load'])

def get_service(load_balancer, replicas):
    if load_balancer == "round_robin":
        selected_service = get_round_robin_service(replicas)
    elif load_balancer == "least_load":
        selected_service = get_least_loaded_service(replicas) 
    
    return selected_service  

def handle_request(method, route, data=None, variant=1, load_balancer="round_robin"):
    """
    Handle HTTP requests with flexible Load Balancing and Circuit Breaker logic.
    """
    if variant == 1:
        selected_service = get_service(load_balancer, auction_service_replicas)
        service_name = 'auction-service'
    elif variant == 2:
        selected_service = get_service(load_balancer, bidder_service_replicas)
        service_name = 'bidder-service'
        
    if not selected_service:
        return jsonify({'error': 'No available services to handle the request'}), 503

    service_url = selected_service['url'] + route

    track_requests_over_interval(service_name=service_name)
    
    try:
        # inc_req_replica(selected_service['url'])

        if method == 'GET':
            response = get(service_url, retry_attempts=FAIL_MAX, timeout=REQ_TIMEOUT)
        elif method == 'POST':
            response = post(service_url, json=data, retry_attempts=FAIL_MAX, timeout=REQ_TIMEOUT)
        elif method == 'PATCH':
            response = patch(service_url, json=data, retry_attempts=FAIL_MAX, timeout=REQ_TIMEOUT)
        elif method == 'DELETE':
            response = delete(service_url, retry_attempts=FAIL_MAX, timeout=REQ_TIMEOUT)
        
        # dec_req_replica(selected_service['url'])

        return jsonify(response.json()), response.status_code

    except pybreaker.CircuitBreakerError:
        if variant == 2:
            remove_service_replica('bidder-service', selected_service['url'])
        return jsonify({'error': 'Circuit breaker is open. Service temporarily unavailable.'}), 503
    except Timeout:
        dec_req_replica(selected_service['url'])
        return jsonify({'error': 'Request to service timed out'}), 504
    except RequestException as e:
        dec_req_replica(selected_service['url'])
        return jsonify({'error': str(e)}), 500
  
@breaker  
def get(url, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    for attempt in range(retry_attempts):
        try:
            inc_req_replica(url)
            response = requests.get(url, timeout=timeout)
            response.raise_for_status()
            dec_req_replica(url)
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)
        
    breaker.open()
    raise pybreaker.CircuitBreakerError()

@breaker  
def post(url, json, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    for attempt in range(retry_attempts):
        try:
            inc_req_replica(url)
            response = requests.post(url, json=json, timeout=timeout)
            response.raise_for_status()
            dec_req_replica(url)
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)
        
    breaker.open()
    raise pybreaker.CircuitBreakerError()

@breaker  
def patch(url, json, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    for attempt in range(retry_attempts):
        try:
            inc_req_replica(url)
            response = requests.patch(url, json=json, timeout=timeout)
            response.raise_for_status()
            dec_req_replica(url)
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)
        
    breaker.open()
    raise pybreaker.CircuitBreakerError()

@breaker  
def delete(url, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    for attempt in range(retry_attempts):
        try:
            inc_req_replica(url)
            response = requests.delete(url, timeout=timeout)
            response.raise_for_status()
            dec_req_replica(url)
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)
        
    breaker.open()
    raise pybreaker.CircuitBreakerError()
    