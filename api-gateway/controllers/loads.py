from flask import Blueprint
from services.replicas_handler import get_service_replicas

loads_blueprint = Blueprint('loads', __name__)

@loads_blueprint.route('/', methods=['GET'])
def ping_auction_service():
    return get_service_replicas()