#!/bin/bash
echo "Start minikube for Kubernetes "

#kubectl proxy --address='0.0.0.0' --disable-filter=true

minikube dashboard --url

echo ""
echo ""
echo "# Minikube dashboard have been started."