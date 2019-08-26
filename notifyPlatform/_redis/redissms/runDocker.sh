#!/bin/bash
sudo docker build -t redissms .
sudo docker run -d --name redissms -p 6381:6381  redissms
sudo docker ps
sudo docker logs -f redissms