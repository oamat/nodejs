#!/bin/bash

docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)

sudo docker ps

echo ""
echo ""
echo "# Docker Containers of MongoDB and Redis have been removed."