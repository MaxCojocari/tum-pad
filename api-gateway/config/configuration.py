import os
from dotenv import load_dotenv

load_dotenv()

APP_HOST = os.getenv('APP_HOST')
APP_PORT = os.getenv('APP_PORT')
SERVICE_DISCOVERY_URL = os.getenv('SERVICE_DISCOVERY_URL')
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
TIMEOUT = int(os.getenv('TIMEOUT')) # seconds
RATE_LIMIT = os.getenv('RATE_LIMIT')
FAIL_MAX = int(os.getenv('FAIL_MAX'))
