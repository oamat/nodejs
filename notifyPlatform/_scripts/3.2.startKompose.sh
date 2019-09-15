#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/komposeGenerated/

kompose up

cd /notifyPlatform/_scripts/

echo ""
echo ""
echo "# the Kompose kubernetes services & deployments have been started with Kompose in /_kubernetes/komposeGenerated/."
echo "# ****ATTENTION: this is for testing: the finals Kubernetes yaml's are in /_kubernetes/kubernetes/." 
echo "# ****ATTENTION: Kompose deploy Kubernetes in Minikube, so it needs Minikube started." 
echo  "You can use 'kubectl get all' or  'kubectl logs [pod or service name]'"