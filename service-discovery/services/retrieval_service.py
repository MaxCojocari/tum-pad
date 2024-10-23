import json
from services.redis_service import redis_client

def get_service_urls(service_name):    
    services_json = redis_client.get(service_name)
    
    if services_json:
        return json.loads(services_json)
    return None

def get_all_service_urls():
    service_keys = redis_client.keys('*-service')

    service_data = {}
    for key in service_keys:
        value = redis_client.get(key)
        service_data[key] = json.loads(value)
    
    return service_data