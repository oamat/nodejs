# COLLECTOR's code for notify Platform
    - apple :  collector that send's PNS to the APP operator  
    - google : collector that send's PNS to the GOO operator
    - microsoft : collector that send's PNS to the MIC operator  
    - movistar : collector that send's SMS to the MOV operator.  
    - movistarVIP : collector that send's SMS to the VIP operator
    - orange : collector that send's SMS to the ORA operator
    - vodafone : collector that send's SMS to the VOD operator

#### In devMode the minimum components for start the aplication are Mongo & Redis, start like here :
- /_mongodb/mongosms/rundocker.sh 
- /_mongodb/mongopns/rundocker.sh 
- /_redis/redissms/rundocker.sh
- /_redis/redispns/rundocker.sh

And finally start application: 
- node index.js     or     app.js

#### You can start all components in docker, docker-compose or Kubernetes if you follow the execution order in _/scripts/ folder.

for more information see  https://github.com/oamat/nodejs/blob/master/notifyPlatform/README.md