#!/bin/bash
sudo docker build -t mongopns .
sudo docker run -d --name mongopns -p 30091:30091  mongopns
sudo docker ps
sudo docker logs -f mongopns