import grpc_server
import threading
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from controllers.auctions import auctions_blueprint
from controllers.bidders import bidders_blueprint
from controllers.bids import bids_blueprint
from controllers.lobbies import lobbies_blueprint
from controllers.service_discovery import service_discovery_blueprint
from config.configuration import REDIS_HOST, REDIS_PORT, RATE_LIMIT

app = Flask(__name__)

limiter = Limiter(
    get_remote_address,
    app=app,
    storage_uri=f"redis://{REDIS_HOST}:{REDIS_PORT}",
    default_limits=[RATE_LIMIT]
)

app.json.sort_keys = False

app.register_blueprint(auctions_blueprint, url_prefix='/auctions')
app.register_blueprint(bidders_blueprint, url_prefix='/bidders')
app.register_blueprint(bids_blueprint, url_prefix='/bids')
app.register_blueprint(service_discovery_blueprint, url_prefix='/discovery')
app.register_blueprint(lobbies_blueprint, url_prefix='/lobbies')

if __name__ == '__main__':
    grpc_thread = threading.Thread(target=grpc_server.serve)
    grpc_thread.start()
    app.run(host='0.0.0.0', port=5000)
