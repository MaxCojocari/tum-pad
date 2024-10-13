import os
from dotenv import load_dotenv
from redis import Redis

load_dotenv()
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')

redis_client = Redis(
    host=REDIS_HOST, 
    port=int(REDIS_PORT), 
    db=0, 
    decode_responses=True
)
