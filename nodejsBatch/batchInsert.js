var CronJob = require('cron').CronJob;
"use strict";
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/batchTest";
var record = 1;

//Cron Cada segundo, se hará un insert: 
new CronJob
  ('* * * * * *', function () {
    insert();
  }, null, true, 'America/Los_Angeles');





function insert() {
  for (var i = 0; i < 50; i++) {
    console.log(record + ' You will see this message every second');
    MongoClient.connect(url, function (err, db) {
      if (err) throw err;
      console.log("db connected " + record + " ");
      var myObjectId = new Date().getTime();
      
      var myobj = { id: myObjectId, name: "Company Inc", content: "Highway 37", mobile: "6994564564", alias: "lacaixa", name1: "Company Inc", content1: "Highway 37", mobile1: "6994564564", alias1: "lacaixa" };
      db.collection("messagePNS").insertOne(myobj, function (err, res) {
        if (err) throw err;
        db.close();
        console.log(record + " record inserted!");
        console.log('Hemos cerrado la db ' + record);
        record++;

      });
    });
  }
}