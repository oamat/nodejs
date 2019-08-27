# NotifyPlatform to send SMS & PNS

Each folder contains a platform module.

# Enviroment: use NODE_ENV env variable  : 
       $env:NODE_ENV="development" 

#Mongodb: Remember starting mongoDB  :
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
  $ rdcli -h 192.168.99.100 / localhost -p 30080  (for redissms) (redis-cli for testing: npm install redis )
  $ rdcli -h 192.168.99.100 / localhost -p 30081  (for redispns) (redis-cli for testing: npm install redis ) 
       # ping      

You can use postman for valid requests to the API (test API.postman_collection.json is the config collection postman file),'url' is a variable and it needs initialize in enviroments