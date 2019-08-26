#!/bin/bash
sudo docker build -t mongopns .
sudo docker run -d --name mongopns -p 27018:27018  mongopns
sudo docker ps
sudo docker logs -f mongopns