import requests
import time
from services.retrieval_service import get_all_service_urls
from config.configuration import HEALTH_CHECK_INTERVAL

def check_health():
    """
    Periodically check the health of all replicas.
    """
    service_data = get_all_service_urls()
    for replica_name, replicas in service_data.items():
        for replica in replicas:
            url = f"http://{replica['host']}:{replica['port']}"
            try:
                response = requests.get(url + "/health", timeout=5)
                response.raise_for_status()
            except Exception as e:
                print(f"ALERT: {replica_name} at {url} is unhealthy! Error: {e}")

def run_health_checker():
    while True:
        check_health()
        time.sleep(HEALTH_CHECK_INTERVAL)
