# SMS MovistarVIP Collector, a module of NotifyPlatform to send SMS

# Enviroment: use   $env:NODE_ENV="developer" for change

#Mongodb: Remember starting mongoDB :
$ cd /notifyPlatform/_mongodb/mongosms/
$ . runDocker.sh
$ cd /notifyPlatform/_mongodb/mongopns/
$ . runDocker.sh


# Redis on nodeJS: Remember starting redis docker container :
$ cd /notifyPlatform/_redis/redissms
$ . runDocker.sh
$ cd /notifyPlatform/_redis/redispns
$ . runDocker.sh

# Redis client :
  $ rdcli -h 192.168.99.100 -p 6380  (for redispns) (redis-cli for testing: npm install redis )
  $ rdcli -h 192.168.99.100 -p 6381  (for redissms) (redis-cli for testing: npm install redis )
       # ping      

You can use postman for valid requests to the API (test API.postman_collection.json is the config collection postman file),'url' is a variable and it needs initialize in enviroments