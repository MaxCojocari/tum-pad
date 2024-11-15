from requests import RequestException
import json
from flask import Blueprint, request, jsonify
from services.request_handler import handle_auction_service_request, handle_bidder_service_request

auctions_blueprint = Blueprint('auctions', __name__)

AUCTION_REQUEST = "create-auction"
LOBBY_REQUEST = "create-lobby"

@auctions_blueprint.route('/', methods=['POST'])
def create_auction():
    data = request.json
    stack_requests = []
    auction_id = None
    lobby_ws_url = None
    
    try:        
        # Step 1: Create auction entry.
        create_auction_response, status_code = handle_auction_service_request('POST', '/auctions', data)        
        create_auction_response_data = json.loads(create_auction_response.data)
        
        if status_code >= 400:
            raise RequestException(create_auction_response_data)
                
        auction_id = create_auction_response_data['auctionId']
        
        print(f"Auction created with ID: {auction_id}")
        stack_requests.append(AUCTION_REQUEST)
    
        # Step 2: Create lobby
        create_lobby_response, status_code = handle_bidder_service_request('POST', '/lobbies', data={'auctionId': auction_id}, variant=2)
        create_lobby_response_data = json.loads(create_lobby_response.data)

        if status_code >= 400:
            raise RequestException(create_lobby_response_data)

        lobby_ws_url = create_lobby_response_data['lobbyWsUrl']
        print(f"Created lobby: {lobby_ws_url}")
        
        stack_requests.append(LOBBY_REQUEST)
        
        response = {
            "auctionId": auction_id,
            "lobbyWsUrl": lobby_ws_url,
            "message": "Auction created successfully"
        }
        
        return jsonify(response), 201

    except RequestException as e:
        print(f"Error in Saga: {e}")
        
        while stack_requests:
            request_type = stack_requests.pop()
            
            try:
                if request_type == AUCTION_REQUEST:
                    delete_auction_response, _ = handle_auction_service_request('DELETE', f'/auctions/{auction_id}', data)
                    message = json.loads(delete_auction_response.data)
                    print(f"Compensated auction creation: {message.get('message', message)}")
                elif request_type == LOBBY_REQUEST:
                    delete_lobby_response, _ = handle_bidder_service_request('DELETE', f'/lobbies/{auction_id}', data)
                    message = json.loads(delete_lobby_response.data)
                    print(f"Compensated lobby creation: {message.get('message', message)}")
            
            except RequestException as e:
                print(f"Failed to compensate: {e}")
            
        return {"status": "failed", "error": str(e)}, 500

@auctions_blueprint.route('/', methods=['GET'])
def get_all_auctions():
    return handle_auction_service_request('GET', '/auctions')

@auctions_blueprint.route('/<int:id>', methods=['GET'])
def get_auction(id):
    return handle_auction_service_request('GET', f'/auctions/{id}')

@auctions_blueprint.route('/<int:id>', methods=['PATCH'])
def update_auction(id):
    data = request.json
    return handle_auction_service_request('PATCH', f'/auctions/{id}', data)

@auctions_blueprint.route('/<int:id>/close', methods=['POST'])
def close_auction(id):
    return handle_auction_service_request('POST', f'/auctions/{id}/close')

@auctions_blueprint.route('/<int:id>', methods=['DELETE'])
def remove_auction(id):
    return handle_auction_service_request('DELETE', f'/auctions/{id}')

@auctions_blueprint.route('/timeout', methods=['GET'])
def test_timeout():
    return handle_auction_service_request('GET', '/timeout')
