{
  "windocker": {
      "comment" : "this is for windows enviroments with mongo and redis in Win docker ip 192.168.99.100, but the api, collectors, cron... codes in local",

      "APISMS_PORT": 30001,
      "APIPNS_PORT": 30002,
      "APIADMIN_PORT": 30003,
      "APISTATUS_PORT": 30004,
      "RETRIESPNS_PORT": 30005,
      "RETRIESSMS_PORT": 30006,

      "MONGODBSMS_URI": "mongodb://root:example@192.168.99.100:30090/admin?authMechanism=SCRAM-SHA-1",
      "MONGODBSMS_PORT": "30090",
      "MONGODBPNS_URI": "mongodb://root:example@192.168.99.100:30091/admin?authMechanism=SCRAM-SHA-1",
      "MONGODBPNS_PORT": "30091",
     
      "REDISSMS_IP": "192.168.99.100",
      "REDISSMS_PORT": "30080",
      "REDISPNS_IP": "192.168.99.100",
      "REDISPNS_PORT": "30081",
    
      "JWT_SECRET": "pojiaj234oi234oij234oij4jgstwsnaKSDADWWssswwwwssQRT"    
   },
   
  "development": {
    "comment" : "this is for linux enviroments with mongo and redis in native docker loclahost, but the api, collectors, cron... codes in local",

    "APISMS_PORT": 30001,
    "APIPNS_PORT": 30002,
    "APIADMIN_PORT": 30003,
    "APISTATUS_PORT": 30004,
    "RETRIESPNS_PORT": 30005,
    "RETRIESSMS_PORT": 30006,

    "MONGODBSMS_URI": "mongodb://root:example@localhost:30090/admin?authMechanism=SCRAM-SHA-1",
    "MONGODBSMS_PORT": "30090",
    "MONGODBPNS_URI": "mongodb://root:example@localhost:30091/admin?authMechanism=SCRAM-SHA-1",
    "MONGODBPNS_PORT": "30091",
    
    "REDISSMS_IP": "localhost",
    "REDISSMS_PORT": "30080",
    "REDISPNS_IP": "localhost",
    "REDISPNS_PORT": "30081",
    
    "JWT_SECRET": "pojiaj234oi234oij234oij4jgstwsnaKSDADWWssswwwwssQRT"
  }, 

  "docker": {
    "comment" : "this is for Kubernetes or docker-composer with mongo and redis as a service name. And the api, collectors, cron... codes as containers",

    "APISMS_PORT": 30001,
    "APIPNS_PORT": 30002,
    "APIADMIN_PORT": 30003,
    "APISTATUS_PORT": 30004,
    "RETRIESPNS_PORT": 30005,
    "RETRIESSMS_PORT": 30006,

    "MONGODBSMS_URI": "mongodb://root:example@mongosms:30090/admin?authMechanism=SCRAM-SHA-1",
    "MONGODBSMS_PORT": "30090",
    "MONGODBPNS_URI": "mongodb://root:example@mongopns:30091/admin?authMechanism=SCRAM-SHA-1",
    "MONGODBPNS_PORT": "30091",

    "REDISSMS_IP": "redissms",
    "REDISSMS_PORT": "30080",
    "REDISPNS_IP": "redissms",
    "REDISPNS_PORT": "30081",
    
    "JWT_SECRET": "pojiaj234oi234oij234oij4jgstwsnaKSDADWWssswwwwssQRT"
  }, 

  "kubernetes": {
    "comment" : "this is for Kubernetes with IP_MASTER_KUBERNETES. And the api, collectors, cron... codes as containers",

    "APISMS_PORT": 30001,
    "APIPNS_PORT": 30002,
    "APIADMIN_PORT": 30003,
    "APISTATUS_PORT": 30004,
    "RETRIESPNS_PORT": 30005,
    "RETRIESSMS_PORT": 30006,

    "MONGODBSMS_URI": "mongodb://root:example@10.0.2.15:30090/admin?authMechanism=SCRAM-SHA-1",
    "MONGODBSMS_PORT": "30090",
    "MONGODBPNS_URI": "mongodb://root:example@10.0.2.15:30091/admin?authMechanism=SCRAM-SHA-1",
    "MONGODBPNS_PORT": "30091",

    "REDISSMS_IP": "10.0.2.15",
    "REDISSMS_PORT": "30080",
    "REDISPNS_IP": "10.0.2.15",
    "REDISPNS_PORT": "30081",
    
    "JWT_SECRET": "pojiaj234oi234oij234oij4jgstwsnaKSDADWWssswwwwssQRT"
  }
}