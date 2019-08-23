#!/bin/bash
echo # build dockerfile
CURRENT_DIR=$PWD
source /notifyPlatform/config/scripts/clean.sh
cd /notifyPlatform/apis/apipns
docker build -t apipns .
cd /notifyPlatform/apis/apisms
docker build -t apisms .
cd /notifyPlatform/apis/apiadmin
docker build -t apiadmin .
cd /notifyPlatform/apis/apistatus
docker build -t apistatus .
cd /notifyPlatform/collectors/pns/apple
docker build -t apple .
cd /notifyPlatform/collectors/pns/google
docker build -t google .
cd /notifyPlatform/collectors/pns/microsoft
docker build -t microsoft .
cd /notifyPlatform/collectors/sms/movistar
docker build -t movistar .
cd /notifyPlatform/collectors/sms/movistarvip
docker build -t movistarvip .
cd /notifyPlatform/collectors/sms/vodafone
docker build -t vodafone .
cd /notifyPlatform/collectors/sms/orange
docker build -t orange .
cd /notifyPlatform/mq/mqpns
docker build -t mqpns .
cd /notifyPlatform/mq/mqsms
docker build -t mqsms .
cd /notifyPlatform/config/redispns
docker build -t redispns .
cd /notifyPlatform/config/redissms
docker build -t redissms .
cd /notifyPlatform/retries/retriespns
docker build -t retriespns .
cd /notifyPlatform/retries/retriessms
docker build -t retriessms .

cd /notifyPlatform/