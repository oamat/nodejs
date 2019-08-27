#!/bin/bash
sudo docker build -t apiadmin .
sudo docker run -d --name apiadmin -p 30003:30003  apiadmin
sudo docker ps
sudo docker logs -f apiadmin