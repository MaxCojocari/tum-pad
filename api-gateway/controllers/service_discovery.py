from flask import Blueprint, jsonify
from grpc_server import get_service_urls, get_all_service_urls

service_discovery_blueprint = Blueprint('service_discovery', __name__)

@service_discovery_blueprint.route('/service/<service_name>', methods=['GET'])
def get_registered_service(service_name):
    """Route to retrieve service URL from the registry with error handling"""
    try:
        service_urls = get_service_urls(service_name)
        
        if service_urls:
            return jsonify({'service_urls': service_urls}), 200
        else:
            return jsonify({'error': 'Service not found'}), 404
    
    except Exception as e:
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500

@service_discovery_blueprint.route('/services', methods=['GET'])
def get_registered_services():
    """Route to retrieve URLs for all services from the registry with error handling"""
    try:
        service_urls = get_all_service_urls()
        
        if not service_urls:
            service_urls = []

        return jsonify({'service_urls': service_urls}), 200
    
    except Exception as e:
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500
