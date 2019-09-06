#!/bin/bash
sudo docker build -t redisconf .
sudo docker run -d --name redisconf -p 30082:30082  redisconf
sudo docker ps
sudo docker logs -f redisconf