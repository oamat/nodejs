#!/bin/bash
sudo docker build -t redispns .
sudo docker run -d --name redispns -p 6380:6380 redispns
sudo docker ps
sudo docker logs -f redispns