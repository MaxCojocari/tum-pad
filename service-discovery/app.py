import grpc_server
import threading
from flask import Flask
from controllers.service_discovery import service_discovery_blueprint
from controllers.health import health_blueprint
from config.configuration import APP_PORT

app = Flask(__name__)

app.json.sort_keys = False
app.register_blueprint(service_discovery_blueprint, url_prefix='/services')
app.register_blueprint(health_blueprint, url_prefix='/health')

if __name__ == '__main__':
    grpc_thread = threading.Thread(target=grpc_server.serve)
    grpc_thread.start()
    app.run(host='0.0.0.0', port=APP_PORT)