#!/bin/bash
echo "Start minikube for Kubernetes "

minikube start --vm-driver=none  --cpus 2 --memory 8192

echo ""
echo ""
echo "# Minikube have been started."
echo "# You can start kubernetes files: the finals Kubernetes yaml's are in /_kubernetes/kubernetes/"
echo "# You can start a little Kubernetes test in /_kubernetes/kubernetes/testNginx/ with :"
echo "# '        kubectl create -f nginx-deployment.yaml' or 'kubectl create -f nginx-service.yaml'"
