//const MongoClient = require('mongodb').MongoClient;   
//const ObjectID = require('mongodb').ObjectID;  
// Is exactly the same of :
const { MongoClient, ObjectID } = require('mongodb');


const url = 'mongodb://localhost:27017';  // Connection url
const dbName = 'test';  // Database Name
const optionsMongo = { useNewUrlParser: true }; //options Mongodb see http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html#.connect
const collection = 'todos';

// Connect using MongoClient
MongoClient.connect(url, optionsMongo, function (err, client) {
  if (err) {
    return console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');
  const col = client.db(dbName).collection(collection);  // Create a collection

  col.findOneAndUpdate({
    _id: new ObjectID('5beb372c941ed127b032d98c')
  }, {
    $set: {
      completed: true,
      text : "Something to findOneAndUpdate"
    }
  }, {
    returnOriginal: false //When false, returns the updated document rather than the original. The default is true.
  }).then((result) => {
    console.log("findOneAndUpdate returned the updated record:" + result);
  });

  col.updateOne({
    _id: new ObjectID('5beb37310410520af04576a4')
  }, {
    $set: {
      completed: true,
      text : "Something to UPDATEONE"
    }
  }).then((result) => {
    console.log("updateOne Collection~updateWriteOpCallback " + result);
  });


  // db.collection('Users').findOneAndUpdate({
  //   _id: new ObjectID('57abbcf4fd13a094e481cf2c')
  // }, {
  //   $set: {
  //     name: 'Andrew'
  //   },
  //   $inc: {
  //     age: 1
  //   }
  // }, {
  //   returnOriginal: false
  // }).then((result) => {
  //   console.log(result);
  // });

  //END Here we can do something
  client.close(function (err) {
    console.log('Close connection to MongoDB server...');
  });
});
