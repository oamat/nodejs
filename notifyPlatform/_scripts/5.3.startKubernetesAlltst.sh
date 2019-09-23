#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/kubernetes/


kubectl create -f apiadmin-deployment.yaml -f apiadmin-service.yaml
sleep 5
kubectl create -f apisms-deployment.yaml -f apisms-service.yaml

cd /notifyPlatform/_scripts/

echo ""
echo ""
echo "# Kubernetes deployments&Services have been started."
echo  "You can use 'kubectl get all' or  'kubectl logs deployment.apps/[name]'"
echo " OR you can write 'curl [IP Kubernetes Master or NodePort]:[port]' , (usually 10.0.2.15 in Linux)"
echo " Or you can execute the command multiple times: 'curl $(minikube ip):[Nodeport]"