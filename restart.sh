#!/bin/bash

docker-compose exec redis-gateway-registry redis-cli FLUSHALL

docker-compose -f docker-compose.prod.yml restart \
    auction-service-1 auction-service-2 auction-service-3 \
    bidder-service-1 bidder-service-2 bidder-service-3 \
    api-gateway