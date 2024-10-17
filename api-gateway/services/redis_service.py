from config.configuration import REDIS_HOST, REDIS_PORT
from redis import Redis

redis_client = Redis(
    host=REDIS_HOST, 
    port=int(REDIS_PORT), 
    db=0, 
    decode_responses=True
)
