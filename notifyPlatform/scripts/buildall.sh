#!/bin/bash
echo # build dockerfile
CURRENT_DIR=$PWD
source /oasis/scripts/clean.sh
cd /oasis/apipns
docker build -t apipns .
cd /oasis/apisms
docker build -t apisms .
cd /oasis/apple
docker build -t apple .
cd /oasis/console
docker build -t console .
cd /oasis/google
docker build -t google .
cd /oasis/microsoft
docker build -t microsoft .
cd /oasis/movistar
docker build -t movistar .
cd /oasis/movistarvip
docker build -t movistarvip .
cd /oasis/mqpns
docker build -t mqpns .
cd /oasis/mqsms
docker build -t mqsms .
cd /oasis/orange
docker build -t orange .
cd /oasis/redisconf
docker build -t redisconf .
cd /oasis/redispns
docker build -t redispns .
cd /oasis/redissms
docker build -t redissms .
cd /oasis/retriespns
docker build -t retriespns .
cd /oasis/retriessms
docker build -t retriessms .
cd /oasis/status
docker build -t status .
cd /oasis/vodafone
docker build -t vodafone .
cd /oasis/