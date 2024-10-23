import grpc
import json
from services.redis_service import redis_client
from concurrent import futures
from proto import service_registry_pb2_grpc, service_registry_pb2
from config.configuration import GRPC_PORT

# python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. proto/service_registry.proto

class ServiceRegistryServicer(service_registry_pb2_grpc.ServiceRegistryServicer):
    def Register(self, request, context):
        existing_services_json = redis_client.get(request.serviceName)
        
        if existing_services_json:
            existing_services = json.loads(existing_services_json)
        else:
            redis_client.persist(request.serviceName)
            existing_services = []

        new_service_info = {
            'host': request.host,
            'port': request.port
        }

        if new_service_info not in existing_services:
            existing_services.append(new_service_info)
            redis_client.set(request.serviceName, json.dumps(existing_services))  # Update Redis with the new list
            message = f"{request.serviceName} registered successfully"
            success = True
        else:
            message = f"Service {request.serviceName} with host {request.host} and port {request.port} is already registered"
            success = True

        return service_registry_pb2.RegisterResponse(
            success=success,
            message=message
        )

def get_service_urls(service_name):    
    services_json = redis_client.get(service_name)
    
    if services_json:
        return json.loads(services_json)
    return None

def get_all_service_urls():
    service_keys = redis_client.keys('*-service')

    service_data = {}
    for key in service_keys:
        value = redis_client.get(key)
        service_data[key] = json.loads(value)
    
    return service_data

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    service_registry_pb2_grpc.add_ServiceRegistryServicer_to_server(ServiceRegistryServicer(), server)
    server.add_insecure_port(f'[::]:{GRPC_PORT}')
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()
