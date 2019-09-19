#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/kubernetes/

kubectl create -f apisms-deployment.yaml -f apisms-service.yaml
kubectl create -f apipns-deployment.yaml -f apipns-service.yaml
kubectl create -f apistatusback-deployment.yaml -f apistatusback-service.yaml

kubectl create -f retriespns-deployment.yaml -f retriespns-service.yaml
kubectl create -f retriessms-deployment.yaml -f retriessms-service.yaml

kubectl create -f mqsms-deployment.yaml
kubectl create -f mqpns-deployment.yaml

kubectl create -f apple-deployment.yaml
kubectl create -f google-deployment.yaml
kubectl create -f microsoft-deployment.yaml

kubectl create -f movistar-deployment.yaml
kubectl create -f movistarvip-deployment.yaml
kubectl create -f orange-deployment.yaml
kubectl create -f vodafone-deployment.yaml




cd /notifyPlatform/_scripts/

echo ""
echo ""
echo "# Kubernetes deployments&Services have been started."
echo  "You can use 'kubectl get all' or  'kubectl logs deployment.apps/[name]'"
echo " OR you can write 'curl [IP Kubernetes Master or NodePort]:[port]' , (usually 10.0.2.15 in Linux)"
echo " Or you can execute the command multiple times: 'curl $(minikube ip):[Nodeport]"