#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/kubernetes/

kubectl create -f mongosms-deployment.yaml -f mongosms-service.yaml
kubectl create -f mongopns-deployment.yaml -f mongopns-service.yaml
kubectl create -f redissms-deployment.yaml -f redissms-service.yaml
kubectl create -f redispns-deployment.yaml -f redispns-service.yaml

cd /notifyPlatform/_scripts/

kubectl get all

echo " *** INFO : wait 20s... "