# NotifyPlatform 
###  This is a project for send notifications SMS & PNS to Operators



### Structure Project : Utils for the project :
- _commons : you can find common codes
- _kubernetes : you can find kubernetes& compose yaml's files
- _mongodbd : contains the mongodb conf & docker/compose files
- _redis : contains the redis conf & docker/compose files
- _scripts : contains all the scripts for developing project, in order by num.
-  Vagrantfile : The vagrant configuration for dev mode in ubuntu-18.04, you can install all dependencies and packages with the script '0.1.installAllDependencies.sh'
-  notifyAPI.postman_collection.json : PostMan file for testing: You can use postman for prove requests to the APIS

### Structure Project : The Project code structure
-  apis : project APIS: apisms, apipns, apiadmin, apistatusback
-  batch : project batch: batchsms, batchpns
-  collectors : project collectors ara crons that sends messages to the operators.
-  mq : project reception MQ requests : mqsms, mqpns
-  retries : project retries status from operator: retriessms, retriespns

### Enviroment : use NODE_ENV env variable  : 
       $env:NODE_ENV="windocker"   : for dev mode in Windows (you need to start almost mongo & redis docker) 
       $env:NODE_ENV="development"  : for dev mode in linux (you need to start almost mongo & redis docker) 
       $env:NODE_ENV="docker" : for docker mode dev, tst, pre or pro (you need to start all modules in docker or docker-compose) 
       $env:NODE_ENV="kubernetes" : for Kubernetes mode dev, tst, pre or pro  (you need to start all modules in docker or docker-compose) 

### Mongodb dependency : Remember starting mongoDB docker container in dev mode  :
- $ cd /notifyPlatform/_mongodb/mongosms/
- $ . runDocker.sh
- $ cd /notifyPlatform/_mongodb/mongopns/
- $ . runDocker.sh



### Redis dependency: Remember starting redis docker container docker container in dev mode :
- $ cd /notifyPlatform/_redis/redissms
- $ . runDocker.sh
- $ cd /notifyPlatform/_redis/redispns
- $ . runDocker.sh


####### you can use Redis client for testing in Linux :
 - $ redis-cli -h 10.0.2.15 / localhost -p 30080  for redissms
 - $ redis-cli -h 10.0.2.15 / localhost -p 30081  for redispns 

####### you can use Redis client for testing in Windows :
  - $ rdcli -h 192.168.99.100 / localhost -p 30080  for redissms (redis-cli for testing: npm install redis )
  - $ rdcli -h 192.168.99.100 / localhost -p 30081  for redispns (redis-cli for testing: npm install redis ) 

