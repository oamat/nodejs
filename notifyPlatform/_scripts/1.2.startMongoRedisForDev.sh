#!/bin/bash

cd /notifyPlatform/_mongodb/mongosms
source runDocker.sh
cd /notifyPlatform/_mongodb/mongopns
source runDocker.sh
cd /notifyPlatform/_redis/redissms
source runDocker.sh
cd /notifyPlatform/_redis/redispns
source runDocker.sh

cd /notifyPlatform/_scripts/