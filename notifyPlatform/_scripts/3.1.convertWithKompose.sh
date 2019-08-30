#!/bin/bash
echo "Generating All Kubernetes files from docker-compose.yaml"


yes | cp -rf /notifyPlatform/_kubernetes/dockercompose/docker-compose.yaml /notifyPlatform/_kubernetes/komposeGenerated/docker-compose.yaml

cd /notifyPlatform/_kubernetes/komposeGenerated/

kompose convert

cd /notifyPlatform/_scripts/