const MongoClient = require('mongodb').MongoClient;

const test = require('assert');
// Connection url
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'test';
// Connect using MongoClient
MongoClient.connect(url, function (err, client) {
  //manage error
  if (err) {
    return console.log('Unable to connect to MongoDB server' + err);
  }
  console.log('Connected to MongoDB server...');
  
  // Create a collection
  const col = client.db(dbName).collection('todos');
  
  //console.log("col.stats : " + col.stats);

  col.insertOne({
    text: 'Something to do',
    completed: false
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert todo', err);
    }
    console.log(JSON.stringify(result.ops, undefined, 2));
  });
  
  client.close(function(err){
     console.log('close connection to MongoDB server...');
  });
 
});






/*   db.collection('Users').insertOne({
    name: 'Andrew',
    age: 25,
    location: 'Philadelphia'
  }, (err, result) => {
    if (err) {
      return console.log('Unable to insert user', err);
    }

    console.log(result.ops);
  });

  db.close();
});
 */