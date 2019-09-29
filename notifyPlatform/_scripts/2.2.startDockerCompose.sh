#!/bin/bash
echo "start docker-compose from /_kubernetes/dockercompose/docker-compose.yaml "
cd /notifyPlatform/_kubernetes/dockercompose/

docker-compose -f docker-compose.yaml up -d 

cd /notifyPlatform/_scripts/

echo ""
echo ""
echo "# the docker-compose.yaml have been started."
echo "# You can use 'docker logs -f [ContainerName]' for watch logs"
echo "# You can enter inside container: 'docker exec -it [ContainerName] /bin/bash'"


