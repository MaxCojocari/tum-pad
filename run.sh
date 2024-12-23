#!/bin/bash

docker build -t tum-pad-auction-service ./auction-service

docker build -t tum-pad-bidder-service ./bidder-service

docker build -t tum-pad-api-gateway ./api-gateway

docker build -t tum-pad-etl-service ./etl-service

docker-compose -f docker-compose.prod.yml up -d \
    redis-1 redis-2 redis-3 redis-gateway-registry \
    postgres-auction postgres-bidder pgadmin \
    mongo1 mongo2 mongo3 mongo-data-warehouse \
    service-discovery etl-service \
    nats

docker-compose exec redis-gateway-registry redis-cli FLUSHALL

docker-compose -f docker-compose.prod.yml up -d \
    auction-service-1 auction-service-2 auction-service-3 \
    bidder-service-1 bidder-service-2 bidder-service-3 \
    api-gateway

docker-compose -f docker-compose.prod.yml up -d prometheus grafana