"use strict";
var CronJob = require('cron').CronJob;
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/batchTest";
var record = 1;

//Cron Cada segundo, se hará un insert: 
new CronJob
  ('* * * * * *', function () {
    log();
  }, null, true, 'America/Los_Angeles');





function log() {  
      console.log(record + ' You will see this message every second');
      record++;
        }
