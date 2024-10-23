from flask import Blueprint, jsonify

health_blueprint = Blueprint('health', __name__)

@health_blueprint.route('/', methods=['GET'])
def health_api_gateway():
    response = {
        'status': 'running'
    }
    return jsonify(response), 200