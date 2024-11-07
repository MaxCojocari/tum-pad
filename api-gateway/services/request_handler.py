import time
import requests
from requests.exceptions import RequestException
from flask import jsonify
from config.configuration import REQ_TIMEOUT, MONITORING_TIME_INTERVAL, \
    AUCTION_SERVICE_CRITICAL_LOAD, BIDDER_SERVICE_CRITICAL_LOAD
from store.replicas import *
from services.redis_service import redis_client
from urllib.parse import urlparse
from pybreaker import CircuitBreakerError
from services.circuit_breaker import auction_breaker, bidder_breaker

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
    redis_key = f"{parsed_url.hostname}_{parsed_url.port}_load"
    redis_client.incr(redis_key)

def dec_req_replica(url):
    parsed_url = urlparse(url)
    redis_key = f"{parsed_url.hostname}_{parsed_url.port}_load"
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
        redis_key = f"{parsed_url.hostname}_{parsed_url.port}_load"
        load = redis_client.get(redis_key) or 0
        replica_info.append({
            "url": f"http://{parsed_url.hostname}:{parsed_url.port}",
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
    global current_replica_index
    if variant == 1:
        replicas, service_name = auction_service_replicas, 'auction-service'
    else:
        replicas, service_name = bidder_service_replicas, 'bidder-service'
    
    if not replicas:
        return jsonify({'error': f'No available instances of {service_name}.'}), 503
    
    track_requests_over_interval(service_name)
    current_replicas = set(replicas)
    
    while current_replicas:
        selected_service = get_service(load_balancer, list(current_replicas))
        service_url = selected_service['url'] + route
        
        try:
            response = make_request(method, service_url, data)

            if (response is not None) and response.status_code < 500:
                return jsonify(response.json()), response.status_code
            
            current_replicas.discard(selected_service['url'])
            
            if current_replicas and load_balancer == "round_robin":
                current_replica_index = (current_replica_index - 1) % len(current_replicas)
                
        except RequestException as e:
            print(f"Error with {selected_service['url']}: {e}")

    raise RequestException("All service instances failed.")


def make_request(method, url, json=None, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    response = None
    for attempt in range(retry_attempts):
        try:
            inc_req_replica(url)
            response = requests.request(method, url, json=json, timeout=timeout)

            if response.status_code >= 500:
                response.raise_for_status()

            dec_req_replica(url)
            return response
        except Exception as e:
            print(f"Retry {attempt + 1}/{retry_attempts} failed with error: {e}")
            time.sleep(retry_backoff)

def get(url, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    return make_request("GET", url, retry_attempts=retry_attempts, timeout=timeout, retry_backoff=retry_backoff)

def post(url, json, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    return make_request("POST", url, json=json, retry_attempts=retry_attempts, timeout=timeout, retry_backoff=retry_backoff)

def patch(url, json, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    return make_request("PATCH", url, json=json, retry_attempts=retry_attempts, timeout=timeout, retry_backoff=retry_backoff)

def delete(url, retry_attempts=3, timeout=REQ_TIMEOUT, retry_backoff=1):
    return make_request("DELETE", url, retry_attempts=retry_attempts, timeout=timeout, retry_backoff=retry_backoff)

def handle_auction_service_request(*args, **kwargs):
    try:
        return auction_breaker.call(handle_request, *args, **kwargs)
    except CircuitBreakerError:
        return jsonify({'error': 'Circuit breaker is open. Auction service temporarily unavailable.'}), 503

def handle_bidder_service_request(*args, **kwargs):
    try:
        return bidder_breaker.call(handle_request, *args, **kwargs)
    except CircuitBreakerError:
        return jsonify({'error': 'Circuit breaker is open. Bidder service temporarily unavailable.'}), 503