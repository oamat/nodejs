#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/
kompose down
minikube stop

cd /notifyPlatform/_scripts/