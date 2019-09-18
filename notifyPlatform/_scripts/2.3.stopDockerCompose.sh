#!/bin/bash
echo "start docker-compose from /_kubernetes/dockercompose/docker-compose.yaml "
cd /notifyPlatform/_kubernetes/dockercompose/

docker-compose -f docker-compose.yaml down 

cd /notifyPlatform/_scripts/
echo ""
echo ""
echo "# the docker-compose.yaml have been stoped."
echo "# ATTENTION: kompose commands are unnecessary, because we have the finals Kubernetes yaml's in /_kubernetes/kubernetes/." 
