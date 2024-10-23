import os
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
GRPC_PORT = os.getenv('GRPC_PORT')
TIMEOUT = 6 # seconds
RATE_LIMIT = "100 per minute"
