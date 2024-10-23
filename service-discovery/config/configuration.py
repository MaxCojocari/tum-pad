import os
from dotenv import load_dotenv

load_dotenv()

APP_HOST = os.getenv('APP_HOST')
APP_PORT = os.getenv('APP_PORT')
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
GRPC_PORT = os.getenv('GRPC_PORT')
