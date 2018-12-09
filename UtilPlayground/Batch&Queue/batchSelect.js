
"use strict";

var Mongo = require('mongodb');
var MongoClient = Mongo.MongoClient;
var ObjectId = Mongo.ObjectID;
var url = "mongodb://localhost:27017/batchTest";

//Select The first
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    db.collection("messagePNS").findOne({}, function (err, result) {
        if (err) throw err;
        console.log(result);
        db.close();
    });
});

//Select by ObjectId MongoDB
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var BSON = Mongo.BSONPure;
    var _id = new ObjectId("598702e6f5fa8a0a00672d57");
    var query = { "_id": _id  };
    db.collection("messagePNS").find(query).toArray(function (err, result) {
        if (err) throw err;
        console.log("result Select by ObjectId:" + result.length);
        db.close();
    });
});

//Select by id->timestamp geretated manual os MongoDB
MongoClient.connect(url, function (err, db) {
    if (err) throw err;
    var query = { "id" : 1502020326980.0 };
    db.collection("messagePNS").find(query).toArray(function (err, result) {
        if (err) throw err;
        console.log("result Select by id->timestamp:" + result.length);
        db.close();
    });
});