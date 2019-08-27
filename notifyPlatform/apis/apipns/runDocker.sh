#!/bin/bash
sudo docker build -t apipns .
sudo docker run -d --name apipns -p 30002:30002  apipns
sudo docker ps
sudo docker logs -f apipns