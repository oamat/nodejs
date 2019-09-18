#!/bin/bash
echo "Generating All Kubernetes files from docker-compose.yaml"


yes | cp -rf /notifyPlatform/_kubernetes/dockercompose/docker-compose.yaml /notifyPlatform/_kubernetes/komposeGenerated/docker-compose.yaml

sed -i 's/"docker"/"kubernetes"/g' /notifyPlatform/_kubernetes/komposeGenerated/docker-compose.yaml
# see https://askubuntu.com/questions/20414/find-and-replace-text-within-a-file-using-commands

cd /notifyPlatform/_kubernetes/komposeGenerated/

kompose convert

sed -i 's/targetPort/nodePort/g' /notifyPlatform/_kubernetes/komposeGenerated/*.yaml
# see https://askubuntu.com/questions/20414/find-and-replace-text-within-a-file-using-commands

cd /notifyPlatform/_scripts/

echo ""
echo ""
echo "# the docker-compose.yaml have been converted to Kubernetes Services & deployment in /_kubernetes/komposeGenerated/."
echo "# ****ATTENTION: this is for testing: kompose commands are unnecessary, because we have the finals Kubernetes yaml's in /_kubernetes/kubernetes/." 