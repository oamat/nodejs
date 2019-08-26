#!/bin/bash
sudo docker build -t mongosms .
sudo docker run -d --name mongosms -p 27019:27019  mongosms
sudo docker ps
sudo docker logs -f mongosms