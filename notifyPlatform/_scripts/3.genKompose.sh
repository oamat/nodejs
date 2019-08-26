#!/bin/bash
echo "Generating All Kubernetes files from docker-compose.yaml"
cd /notifyPlatform/_kubernetes/
kompose convert

cd /notifyPlatform/_scripts/