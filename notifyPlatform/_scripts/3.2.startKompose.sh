#!/bin/bash
echo "Start All Kubernetes files from Notify Platform "
cd /notifyPlatform/_kubernetes/komposeGenerated/

kompose up

cd /notifyPlatform/_scripts/