import os
import grpc_server
import threading
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from controllers.auctions import auctions_blueprint
from controllers.bidders import bidders_blueprint
from controllers.bids import bids_blueprint
from controllers.service_discovery import service_discovery_blueprint
from dotenv import load_dotenv

load_dotenv()
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')

app = Flask(__name__)

limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=f"redis://{REDIS_HOST}:{REDIS_PORT}",
    default_limits=["5 per minute"]
)

app.json.sort_keys = False

app.register_blueprint(auctions_blueprint, url_prefix='/auctions')
app.register_blueprint(bidders_blueprint, url_prefix='/bidders')
app.register_blueprint(bids_blueprint, url_prefix='/bids')
app.register_blueprint(service_discovery_blueprint, url_prefix='/discovery')

if __name__ == '__main__':
    grpc_thread = threading.Thread(target=grpc_server.serve)
    grpc_thread.start()
    app.run(host='0.0.0.0', port=5000)
