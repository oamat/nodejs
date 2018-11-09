//const MongoClient = require('mongodb').MongoClient;   
//const ObjectID = require('mongodb').ObjectID;  
// Is exactly the same of :
const { MongoClient, ObjectID } = require('mongodb');

var obj = new ObjectID();
console.log(obj);  // if I need to insert some objects manualy


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
  // Create a collection we want to drop later
  const col = client.db(dbName).collection(collection);
  col.find({ _id: new ObjectID("5be369d7a0ba6f5696bda1ab") })
    .toArray().then((docs) => {
      console.log('col.find({ _id: new ObjectID("5be369d7a0ba6f5696bda1ab") }) RESULTS:');
      console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
      console.log('Unable to fetch todos', err);
    });

  col.find({ completed: true })
    .toArray().then((docs) => {
      console.log("\n\ncol.find({ completed: true }) RESULTS:");
      console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
      console.log('Unable to fetch todos', err);
    });


  col.find({ completed: false }).count().then((count) => {
    console.log("\n\ncol.find({ completed: false }).count() RESULTS:");
    console.log(`Todos count: ${count}`);
  }, (err) => {
    console.log('Unable to fetch todos', err);
  });

  // db.collection('Users').find({ name: 'Andrew' }).toArray().then((docs) => {
  //   console.log(JSON.stringify(docs, undefined, 2));
  // });

  client.close(function (err) {
    console.log('Close connection to MongoDB server...');
  });
});
