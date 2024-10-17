import os
from dotenv import load_dotenv

load_dotenv()

REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
# Global timeout value in seconds
TIMEOUT = 6
RATE_LIMIT="100 per minute"
