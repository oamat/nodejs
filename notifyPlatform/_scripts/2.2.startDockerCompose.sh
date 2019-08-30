#!/bin/bash
echo "start docker-compose from /_kubernetes/kubernetes/docker-compose.yaml "
cd /notifyPlatform/_kubernetes/

docker-compose -f docker-compose.yaml up -d 

cd /notifyPlatform/_scripts/
