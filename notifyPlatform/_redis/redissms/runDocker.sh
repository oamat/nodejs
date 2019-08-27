#!/bin/bash
sudo docker build -t redissms .
sudo docker run -d --name redissms -p 30080:30080  redissms
sudo docker ps
sudo docker logs -f redissms