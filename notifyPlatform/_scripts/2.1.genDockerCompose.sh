#!/bin/bash
echo "Generating docker-compose.yaml in /_kubernetes/dockercompose/"
node /notifyPlatform/_scripts/replace.js
echo ""
echo ""
echo "# the docker-compose.yaml have been created in /_kubernetes/dockercompose/."