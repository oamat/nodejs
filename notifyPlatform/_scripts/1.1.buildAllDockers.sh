#!/bin/bash
echo "build dockerfiles"
CURRENT_DIR=$PWD
source /notifyPlatform/config/scripts/clean.sh
#MongoDB
cd /notifyPlatform/_mongodb/mongosms
docker build -t mongosms .
cd /notifyPlatform/_mongodb/mongopns
docker build -t mongopns .
#API Interfaces
cd /notifyPlatform/apis/apipns
docker build -t apipns .
cd /notifyPlatform/apis/apisms
docker build -t apisms .
cd /notifyPlatform/apis/apiadmin
docker build -t apiadmin .
cd /notifyPlatform/apis/apistatusback
docker build -t apistatusback .
#Collectors PNS
cd /notifyPlatform/collectors/pns/apple
docker build -t apple .
cd /notifyPlatform/collectors/pns/google
docker build -t google .
cd /notifyPlatform/collectors/pns/microsoft
docker build -t microsoft .
#Collectors SMS
cd /notifyPlatform/collectors/sms/movistar
docker build -t movistar .
cd /notifyPlatform/collectors/sms/movistarvip
docker build -t movistarvip .
cd /notifyPlatform/collectors/sms/vodafone
docker build -t vodafone .
cd /notifyPlatform/collectors/sms/orange
docker build -t orange .
#MQ Interfaces
cd /notifyPlatform/mq/mqpns
docker build -t mqpns .
cd /notifyPlatform/mq/mqsms
docker build -t mqsms .
#Redis
cd /notifyPlatform/_redis/redispns
docker build -t redispns .
cd /notifyPlatform/_redis/redissms
docker build -t redissms .
cd /notifyPlatform/_redis/redisconf
docker build -t redisconf .
#Retries Interfaces
cd /notifyPlatform/retries/retriespns
docker build -t retriespns .
cd /notifyPlatform/retries/retriessms
docker build -t retriessms .
#batch Interfaces
cd /notifyPlatform/batch/batchpns
docker build -t batchpns .
cd /notifyPlatform/batch/batchsms
docker build -t batchsms .
#serverdummy for testing
cd /notifyPlatform/collectors/serverdummy
docker build -t serverdummy .

cd /notifyPlatform/_scripts/

echo ""
echo ""
echo "# Docker images have been created."