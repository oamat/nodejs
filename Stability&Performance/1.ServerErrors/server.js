const express = require('express');

var app = express();

app.get('/', (req, res) => {
  res.send('<h1>Hello Express!</h1>');  
});

app.get('/error', (req, res) => {
  var err = new Error('This is an example error.');
  throw(err);
});

app.listen(3000);
console.log("Server start at port : 3000"  );
