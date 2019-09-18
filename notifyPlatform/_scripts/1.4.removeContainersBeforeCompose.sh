#!/bin/bash

docker container stop $(docker container ls -aq)
docker container rm $(docker container ls -aq) --force
docker container prune

echo ""
echo ""
echo "# Docker Containers of MongoDB and Redis have been removed."