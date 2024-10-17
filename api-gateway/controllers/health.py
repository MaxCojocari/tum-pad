import redis
from flask import Blueprint, jsonify
from services.redis_service import redis_client

health_blueprint = Blueprint('health', __name__)

@health_blueprint.route('/api-gateway', methods=['GET'])
def health_api_gateway():
    response = {
        'status': 'running',
        'service': 'api-gateway'
    }
    return jsonify(response), 200

@health_blueprint.route('/service-discovery', methods=['GET'])
def health_discovery():
    try:
        redis_client.ping()
        redis_status = 'connected'
    except redis.exceptions.ConnectionError:
        redis_status = 'disconnected'

    response = {
        'status': 'running',
        'redis_status': redis_status,
        'service': 'service-discovery'
    }

    if redis_status == 'disconnected':
        return jsonify(response), 500
    else:
        return jsonify(response), 200