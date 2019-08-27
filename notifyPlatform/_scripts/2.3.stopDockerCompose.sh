#!/bin/bash
echo "start docker-compose from /_kubernetes/docker-compose.yaml "
cd /notifyPlatform/_kubernetes/

docker-compose -f docker-compose.yaml down 

cd /notifyPlatform/_scripts/
