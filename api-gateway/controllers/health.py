import redis
from flask import Blueprint, jsonify
from services.redis_service import redis_client

health_blueprint = Blueprint('health', __name__)

@health_blueprint.route('/', methods=['GET'])
def health_api_gateway():
    try:
        redis_client.ping()
        redis_status = 'connected'
    except redis.exceptions.ConnectionError:
        redis_status = 'disconnected'

    response = {
        'status': 'running',
        'redis_status': redis_status,
        'service_name': 'api-gateway'
    }

    if redis_status == 'disconnected':
        return jsonify(response), 500
    else:
        return jsonify(response), 200