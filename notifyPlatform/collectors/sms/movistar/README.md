# SMS Movistar Collector, a cron module of NotifyPlatform to receive SMS from Redis and send it to the operator


#### In devMode the minimum components for start the aplication are Mongo & Redis, start like here :
- /_mongodb/mongosms/rundocker.sh 
- /_mongodb/mongopns/rundocker.sh 
- /_redis/redissms/rundocker.sh
- /_redis/redispns/rundocker.sh

And finally start application: 
- node index.js     or     app.js

#### You can start all components in docker, docker-compose or Kubernetes if you follow the execution order in _/scripts/ folder.

for more information see  https://github.com/oamat/nodejs/blob/master/notifyPlatform/README.md