#!/bin/bash
echo "Stopping All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/kubernetes/

kubectl delete -f apisms-deployment.yaml -f apisms-service.yaml
kubectl delete -f apipns-deployment.yaml -f apipns-service.yaml
kubectl delete -f apistatusback-deployment.yaml -f apistatusback-service.yaml
kubectl delete -f apiadmin-deployment.yaml -f apiadmin-service.yaml

kubectl delete -f retriespns-deployment.yaml -f retriespns-service.yaml
kubectl delete -f retriessms-deployment.yaml -f retriessms-service.yaml

kubectl delete -f mqsms-deployment.yaml
kubectl delete -f mqpns-deployment.yaml

kubectl delete -f batchsms-deployment.yaml
kubectl delete -f batchpns-deployment.yaml

kubectl delete -f apple-deployment.yaml
kubectl delete -f google-deployment.yaml
kubectl delete -f microsoft-deployment.yaml

kubectl delete -f movistar-deployment.yaml
kubectl delete -f movistarvip-deployment.yaml
kubectl delete -f orange-deployment.yaml
kubectl delete -f vodafone-deployment.yaml

kubectl delete -f mongosms-deployment.yaml -f mongosms-service.yaml
kubectl delete -f mongopns-deployment.yaml -f mongopns-service.yaml
kubectl delete -f redissms-deployment.yaml -f redissms-service.yaml
kubectl delete -f redispns-deployment.yaml -f redispns-service.yaml
kubectl delete -f redisconf-deployment.yaml -f redisconf-service.yaml
kubectl delete -f serverdummy-deployment.yaml -f serverdummy-service.yaml
kubectl delete pods --all --grace-period=0 --force   

cd /notifyPlatform/_scripts/

echo ""
echo ""
echo "# Kubernetes deployments&Services have been stopped."
