#!/bin/bash
echo "Stopping All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/

minikube stop

cd /notifyPlatform/_scripts/

echo ""
echo ""
echo "# Minikube have been stopped."