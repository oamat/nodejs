var http = require('http');

//SERVER ON PORT 3000 
http.createServer(function (req, res) {
  res.write('OK'); //write a response
  res.end(); //end the response
}).listen(3000, function () {
  console.log("server start at port 3000"); //the server object listens on port 3000
});