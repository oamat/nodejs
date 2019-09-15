#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/komposeGenerated/

kompose down

cd /notifyPlatform/_scripts/


echo ""
echo ""
echo "# the Kompose kubernetes services & deployments have been stoped with Kompose in /_kubernetes/komposeGenerated/."
echo "# ****ATTENTION: this is for testing: the finals Kubernetes yaml's are in /_kubernetes/kubernetes/.