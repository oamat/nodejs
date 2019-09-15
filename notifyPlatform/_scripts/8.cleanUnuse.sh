#!/bin/bash
# script that delete image docker without name
# example:  . build.sh console



docker rm  $(docker ps -a -f status=exited -q)
docker rmi $(docker images -f dangling=true)
# docker images -f dangling=true

#docker ps -q | xargs docker rm -fv 
#docker images | grep "<none>" | xargs docker rmi --force   
       

docker images
docker ps

echo ""
echo ""
echo "# Unused images & containers have been removed."