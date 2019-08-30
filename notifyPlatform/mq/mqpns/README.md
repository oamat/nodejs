# MQPns, a MQ reception module of NotifyPlatform to receive PNS request from MQ and send it to redis / mongodb


#### In devMode the minimum components for start the aplication are Mongo & Redis, start like here :
- /_mongodb/mongosms/rundocker.sh 
- /_mongodb/mongopns/rundocker.sh 
- /_redis/redissms/rundocker.sh
- /_redis/redispns/rundocker.sh

And finally start application: 
- node index.js

for more information see  https://github.com/oamat/nodejs/blob/master/notifyPlatform/README.md