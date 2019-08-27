#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/

kubectl create -f mongosms-deployment.yaml -f mongosms-service.yaml
kubectl create -f mongopns-deployment.yaml -f mongopns-service.yaml
kubectl create -f redissms-deployment.yaml -f redissms-service.yaml
kubectl create -f redispns-deployment.yaml -f redispns-service.yaml

echo " *** INFO : wait 20s... "
sleep 20

kubectl create -f apisms-deployment.yaml -f apisms-service.yaml
kubectl create -f apipns-deployment.yaml -f apipns-service.yaml
kubectl create -f apistatus-deployment.yaml -f apistatus-service.yaml
kubectl create -f apiadmin-deployment.yaml -f apiadmin-service.yaml

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


echo " *** INFO : you can write 'curl [IP NodePort]:80' "
echo " *** INFO :  OR you can write 'curl [IP Kubernetes Master]:30002' , (usually 10.0.2.15)"