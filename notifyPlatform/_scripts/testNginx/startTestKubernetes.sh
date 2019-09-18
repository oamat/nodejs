#!/bin/bash

kubectl create -f nginx-deployment.yaml
kubectl create -f nginx-service.yaml
kubectl get all
kubectl cluster-info
echo " you can write 'curl [IP NodePort]:80' "
echo " OR you can write 'curl [IP Kubernetes Master]:30002' , (usually 10.0.2.15)"
echo " Or you can execute the command multiple times: 'curl $(minikube ip):[Nodeport]"
echo " you can use 'kubectl scale deployments.apps/nginx --replicas=1' for replicas"
