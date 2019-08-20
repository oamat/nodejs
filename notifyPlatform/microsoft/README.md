# PNS Microsoft Collector, a module of NotifyPlatform to send SMS

#Mongodb: Remember starting mongoDB :
.\mongod.exe -dbpath E:\dev\mongodb\mongo-data\
.\mongo.exe (for command line)

# Redis on nodeJS: Remember starting redis docker container :
  $ docker run -d --name redis -p 6379:6379 redis
  $ rdcli -h 192.168.99.100  (the docker IP) (redis-cli for testing: npm install redis )
       # ping      

You can use postman for valid requests to the API (test API.postman_collection.json is the config collection postman file),'url' is a variable and it needs initialize in enviroments