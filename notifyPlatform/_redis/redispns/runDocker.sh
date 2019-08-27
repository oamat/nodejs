#!/bin/bash
sudo docker build -t redispns .
sudo docker run -d --name redispns -p 30081:30081 redispns
sudo docker ps
sudo docker logs -f redispns