#!/bin/bash
# script that delete image docker without name
# example:  . build.sh console

kubectl delete pods --all --grace-period=0 --force 

yes | docker system prune -a

docker rm $(docker ps -a -f status=exited -f status=created -q)

#docker ps -q | xargs docker rm -fv  
#docker images -q | xargs docker rmi --force

docker images
docker ps

echo ""
echo ""
echo "# All images & containers have been removed."