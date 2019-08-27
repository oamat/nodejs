#!/bin/bash
sudo docker build -t mongosms .
sudo docker run -d --name mongosms -p 30090:30090 mongosms
sudo docker ps
sudo docker logs -f mongosms