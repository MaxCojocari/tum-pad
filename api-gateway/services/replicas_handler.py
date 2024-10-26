import json
from services.redis_service import redis_client
from urllib.parse import urlparse
from store.replicas import *

def get_service_replicas():
    auction_replica_total_info = []
    bidder_replica_total_info = []
    
    auction_service_replicas_local = []
    bidder_service_replicas_local = []
    
    json_auction_service_replicas_local = redis_client.get('auction-service')
    json_bidder_service_replicas_local = redis_client.get('bidder-service')
    
    if json_auction_service_replicas_local:
        auction_service_replicas_local = json.loads(json_auction_service_replicas_local)

    if json_bidder_service_replicas_local:
        bidder_service_replicas_local = json.loads(json_bidder_service_replicas_local)
    
    for data in auction_service_replicas_local:
        redis_key = f"{data['host']}_{data['port']}_load"
        load = redis_client.get(redis_key) or 0
        auction_replica_total_info.append({
            "url": f"http://{data['host']}:{data['port']}",
            "load": int(load)
        })

    for data in bidder_service_replicas_local:
        redis_key = f"{data['host']}_{data['port']}_load"
        load = redis_client.get(redis_key) or 0
        bidder_replica_total_info.append({
            "url": f"http://{data['host']}:{data['port']}",
            "load": int(load)
        })
    
    return {
        'auction-service': auction_replica_total_info,
        'bidder-service': bidder_replica_total_info
    }
  
def load_service_replicas():
    services = ['auction-service', 'bidder-service']
    for service in services:
        value = redis_client.get(service)
        if value:
            replicas = json.loads(value)
            for replica in replicas:
                if service == 'auction-service':                    
                    auction_service_replicas.append(f"http://{replica['host']}:{replica['port']}")
                elif service == 'bidder-service':
                    bidder_service_replicas.append(f"http://{replica['host']}:{replica['port']}")

def handle_auction_service_register_message(message):
    append_new_replica(auction_service_replicas, message=message)

def handle_bidder_service_register_message(message):
    append_new_replica(bidder_service_replicas, message=message)
    
def append_new_replica(replicas, message):
    parsed_msg = json.loads(message['data'])
    host = parsed_msg.get('host')
    port = parsed_msg.get('port')
    
    new_replica = f"http://{host}:{port}"

    if not any(replica == new_replica for replica in replicas):
        replicas.append(new_replica)
    
    redis_key = f"{host}_{port}_load"
    redis_client.expire(redis_key, 0)
    
def remove_service_replica(service_name, url):  
    global auction_service_replicas, bidder_service_replicas
    parsed_url = urlparse(url)
    host = parsed_url.hostname
    port = parsed_url.port
    
    replicas_info = json.loads(redis_client.get(service_name))
    filtered_replicas_info = [info for info in replicas_info if info['host'] != host or info['port'] != port]
    redis_client.set(service_name, json.dumps(filtered_replicas_info))
    
    if service_name == 'auction-service':
        auction_service_replicas.remove(url)

    elif service_name == 'bidder-service':
        bidder_service_replicas.remove(url)
        
    redis_key = f"{host}_{port}_load"
    redis_client.delete(redis_key)

def subscribe_to_service_registration_events():
    pubsub = redis_client.pubsub()
    pubsub.subscribe(**{'auction-service': handle_auction_service_register_message})
    pubsub.subscribe(**{'bidder-service': handle_bidder_service_register_message})
    pubsub.run_in_thread(sleep_time=0.001)