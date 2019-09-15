#!/bin/bash

docker stop mongosms
docker stop mongopns
docker stop redissms
docker stop redispns
docker stop redisconf

sudo docker ps

echo ""
echo ""
echo "# Docker Containers of MongoDB and Redis have been stoped."