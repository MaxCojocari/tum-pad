from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from controllers.auctions import auctions_blueprint
from controllers.bidders import bidders_blueprint
from controllers.bids import bids_blueprint
from controllers.lobbies import lobbies_blueprint
from controllers.ping import ping_blueprint
from controllers.ping_with_errors import ping_with_errors_blueprint
from controllers.health import health_blueprint
from controllers.loads import loads_blueprint
from config.configuration import REDIS_HOST, REDIS_PORT, RATE_LIMIT, APP_PORT
from services.replicas_handler import subscribe_to_service_registration_events, load_service_replicas

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
app.register_blueprint(lobbies_blueprint, url_prefix='/lobbies')
app.register_blueprint(ping_blueprint, url_prefix='/ping')
app.register_blueprint(ping_with_errors_blueprint, url_prefix='/ping-with-errors')
app.register_blueprint(health_blueprint, url_prefix='/health')
app.register_blueprint(loads_blueprint, url_prefix='/services/loads')

if __name__ == '__main__':
    subscribe_to_service_registration_events()
    load_service_replicas()
    app.run(host='0.0.0.0', port=APP_PORT)
