#!/bin/bash

sudo docker run -d --name mongosms -p 30090:30090  mongosms
sudo docker run -d --name mongopns -p 30091:30091  mongopns
sudo docker run -d --name redissms -p 30080:30080  redissms
sudo docker run -d --name redispns -p 30081:30081  redispns
sudo docker run -d --name redisconf -p 30082:30082  redisconf

sudo docker start mongosms
sudo docker start mongopns
sudo docker start redissms
sudo docker start redispns
sudo docker start redisconf

sudo docker ps
echo ""
echo ""
echo "# Docker Containers of MongoDB and Redis ready to use."
echo "# We can start node modules with 'node index.js' or run docker with 'docker run -d --name ...'"