#!/bin/bash
sudo docker build -t apisms .
sudo docker run -d --name apisms -p 30001:30001  apisms
sudo docker ps
sudo docker logs -f apisms