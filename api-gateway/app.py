from flask import Flask
from controllers.auctions import auctions_blueprint
from controllers.bidders import bidders_blueprint
from controllers.bids import bids_blueprint
from services.service_urls import AUCTIONS_SERVICE_URL

app = Flask(__name__)

app.json.sort_keys = False

app.register_blueprint(auctions_blueprint, url_prefix='/auctions')
app.register_blueprint(bidders_blueprint, url_prefix='/bidders')
app.register_blueprint(bids_blueprint, url_prefix='/bids')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)