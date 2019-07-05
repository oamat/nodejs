#!/bin/bash
# script that delete image docker without name
# example:  . build.sh console
docker ps -q | xargs docker rm -fv  
docker images -q | xargs docker rmi --force
docker images -q | xargs docker rmi --force
docker images -q | xargs docker rmi --force   
       