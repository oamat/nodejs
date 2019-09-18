#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/kubernetes/

kubectl create -f mongosms-deployment.yaml -f mongosms-service.yaml
kubectl create -f mongopns-deployment.yaml -f mongopns-service.yaml
kubectl create -f redissms-deployment.yaml -f redissms-service.yaml
kubectl create -f redispns-deployment.yaml -f redispns-service.yaml
kubectl create -f redisconf-deployment.yaml -f redisconf-service.yaml

cd /notifyPlatform/_scripts/

kubectl get all

echo ""
echo ""
echo "# Kubernetes deployments&Services of MongoDB and Redis have been started."
echo  "You can use 'kubectl get all' or  'kubectl logs deployment.apps/[name]'"
echo " OR you can write 'curl [IP Kubernetes Master or NodePort]:[port]' , (usually 10.0.2.15 in Linux)"
echo " Or you can execute the command multiple times: 'curl $(minikube ip):[Nodeport]"
echo "# ****ATTENTION: wait 20s... before start the rest of Kubernetes files. "