"use strict";
var CronJob = require('cron').CronJob;
var Mongo = require('mongodb');
var MongoClient = Mongo.MongoClient;
var ObjectId = Mongo.ObjectID;
var url = "mongodb://localhost:27017/batchTest";
var num = 1;


new CronJob
    ('* * * * * *', function () {
        deleteFirst();
    }, null, true, 'America/Los_Angeles');


function deleteFirst() {
    console.log(num + ' You will see this message every second');
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var BSON = Mongo.BSONPure;
        var collection = db.collection("messagePNS");

        collection.findOne({}, function (err, result) {
            if (err) throw err;
            console.log("Selected the first document:" + result._id);

            // envío: 
            
            var _id = new ObjectId(result._id);
            var query = { "_id": _id };
            collection.deleteOne(query, function (err, obj) {
                if (err) throw err;
                console.log(num + " document deleted:" + obj);
                num++;
                db.close();
            });
        });
    });
}
