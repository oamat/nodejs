const express = require('express');
const app = express();

const {test} =  require('./functions/test.js');

app.get('/test', (req, res) => {
    res.send(test());
  });
  
app.listen(3000, () => {
    console.log('Server Started on port 3000');
  });