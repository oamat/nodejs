
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

  //Here we can do something
  // deleteOne is used to delete a single document
  col.deleteOne({ text: 'Something to do' }).then((result) => {
    console.log("deleteOne : " + result);
    //console.log(result);
  });

  // findOneAndDelete returns the deleted document after having deleted it (in case you need its contents after the delete operation);
  col.findOneAndDelete({
    _id: new ObjectID("5be36a50a0ba6f5696bda1ad")
  }).then((result) => {
    console.log("findOneAndDelete : " + result);
  });

  //deleteMany
  col.deleteMany({ text: 'Something to do' }).then((result) => {
    console.log("deleteMany : " + result);
  });


  //END Here we can do something
  client.close(function (err) {
    console.log('Close connection to MongoDB server...');
  });
});


