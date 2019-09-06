# REDIS configrations For notify Platform

#### In devMode the minimum components for start the aplication are Mongo & Redis, start like here :
- /_mongodb/mongosms/rundocker.sh 
- /_mongodb/mongopns/rundocker.sh 
- /_redis/redissms/rundocker.sh
- /_redis/redispns/rundocker.sh
- /_redis/redisconf/rundocker.sh

### Redis dependency: Remember starting redis docker container docker container in dev mode :
- $ cd /notifyPlatform/_redis/redissms
- $ . runDocker.sh
- $ cd /notifyPlatform/_redis/redispns
- $ . runDocker.sh
- $ cd /notifyPlatform/_redis/redisconf
- $ . runDocker.sh


####### you can use Redis client for testing in Linux :
 - $ redis-cli -h 10.0.2.15 / localhost -p 30080  for redissms
 - $ redis-cli -h 10.0.2.15 / localhost -p 30081  for redispns 
 - $ redis-cli -h 10.0.2.15 / localhost -p 30082  for redisconf 

####### you can use Redis client for testing in Windows :
  - $ rdcli -h 192.168.99.100 / localhost -p 30080  for redissms (redis-cli for testing: npm install redis )
  - $ rdcli -h 192.168.99.100 / localhost -p 30081  for redispns (redis-cli for testing: npm install redis ) 
  - $ rdcli -h 192.168.99.100 / localhost -p 30082  for redisconf (redis-cli for testing: npm install redis ) 
  
#### You can start all components in docker, docker-compose or Kubernetes if you follow the execution order in _/scripts/ folder.

for more information see  https://github.com/oamat/nodejs/blob/master/notifyPlatform/README.md