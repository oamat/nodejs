#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/

kubectl delete -f mongosms-deployment.yaml -f mongosms-service.yaml
kubectl delete -f mongopns-deployment.yaml -f mongopns-service.yaml
kubectl delete -f redissms-deployment.yaml -f redissms-service.yaml
kubectl delete -f redispns-deployment.yaml -f redispns-service.yaml
kubectl delete -f apisms-deployment.yaml -f apisms-service.yaml

cd /notifyPlatform/_scripts/