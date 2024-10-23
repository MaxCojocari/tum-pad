import os
from dotenv import load_dotenv

load_dotenv()

APP_HOST = os.getenv('APP_HOST')
APP_PORT = os.getenv('APP_PORT')
SERVICE_DISCOVERY_URL = os.getenv('SERVICE_DISCOVERY_URL')
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
TIMEOUT = 6 # seconds
RATE_LIMIT = "100 per minute"
