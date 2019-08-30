#!/bin/bash
echo "start docker-compose from /_kubernetes/dockercompose/docker-compose.yaml "
cd /notifyPlatform/_kubernetes/dockercompose/

docker-compose -f docker-compose.yaml up -d 

cd /notifyPlatform/_scripts/
