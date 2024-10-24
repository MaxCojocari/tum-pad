import os
from dotenv import load_dotenv

load_dotenv()

APP_HOST = os.getenv('APP_HOST')
APP_PORT = os.getenv('APP_PORT')
SERVICE_DISCOVERY_URL = os.getenv('SERVICE_DISCOVERY_URL')
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
REQ_TIMEOUT = int(os.getenv('REQ_TIMEOUT')) # seconds
RATE_LIMIT = os.getenv('RATE_LIMIT')
FAIL_MAX = int(os.getenv('FAIL_MAX'))
AUCTION_SERVICE_CRITICAL_LOAD = int(os.getenv('AUCTION_SERVICE_CRITICAL_LOAD'))
BIDDER_SERVICE_CRITICAL_LOAD = int(os.getenv('BIDDER_SERVICE_CRITICAL_LOAD'))
MONITORING_TIME_INTERVAL = int(os.getenv('MONITORING_TIME_INTERVAL'))