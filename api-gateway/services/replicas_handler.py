import json
from services.redis_service import redis_client
from urllib.parse import urlparse
from store.replicas import *

def get_service_replicas():
    return {
        'auction-service': auction_service_replicas,
        'bidder-service': bidder_service_replicas
    }
  
def load_service_replicas():
    services = ['auction-service', 'bidder-service']
    for service in services:
        value = redis_client.get(service)
        if value:
            replicas = json.loads(value)
            for replica in replicas:
                if service == 'auction-service':                    
                    auction_service_replicas.append({
                        "url": f"http://{replica['host']}:{replica['port']}",
                        "load": 0 
                    })
                elif service == 'bidder-service':
                    bidder_service_replicas.append({
                        "url": f"http://{replica['host']}:{replica['port']}",
                        "load": 0 
                    })

def handle_auction_service_register_message(message):
    append_new_replica(auction_service_replicas, message=message)

def handle_bidder_service_register_message(message):
    append_new_replica(bidder_service_replicas, message=message)
    
def append_new_replica(replicas, message):
    parsed_msg = json.loads(message['data'])
    host = parsed_msg.get('host')
    port = parsed_msg.get('port')
    
    new_replica = {
        "url": f"http://{host}:{port}",
        "load": 0
    }
    
    if not any(replica["url"] == new_replica["url"] for replica in replicas):
        replicas.append(new_replica)
    
def remove_service_replica(service_name, url):  
    global auction_service_replicas, bidder_service_replicas
    parsed_url = urlparse(url)
    host = parsed_url.hostname
    port = parsed_url.port
    
    replicas_info = json.loads(redis_client.get(service_name))
    filtered_replicas_info = [info for info in replicas_info if info['host'] != host or info['port'] != port]
    redis_client.set(service_name, json.dumps(filtered_replicas_info))
    
    if service_name == 'auction-service':
        for info in auction_service_replicas:
            if info['url'] == url:
                auction_service_replicas.remove(info)
                break

    elif service_name == 'bidder-service':
        for info in bidder_service_replicas:
            if info['url'] == url:
                bidder_service_replicas.remove(info)
                break

def subscribe_to_service_registration_events():
    pubsub = redis_client.pubsub()
    pubsub.subscribe(**{'auction-service': handle_auction_service_register_message})
    pubsub.subscribe(**{'bidder-service': handle_bidder_service_register_message})
    pubsub.run_in_thread(sleep_time=0.001)