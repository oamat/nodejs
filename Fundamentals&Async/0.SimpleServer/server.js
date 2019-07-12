var http = require('http');

//SERVER ON PORT 3000 
http.createServer(function (req, res) {
  res.write('Hello World port 3000!'); //write a response
  res.end(); //end the response
}).listen(3000, function () {
  console.log("server start at port 3000"); //the server object listens on port 3000
});








//-------------------------------------------------
//SERVER ON PORT 3001 WITH FUCNTIONS EXTRACTED
http.createServer(function (req, res) {
  helloworld(req, res);
}).listen(3001, logger());


function helloworld(req, res) {
  res.write('Hello World port 3001'); //write a response
  res.end(); //end the response
}


function logger() {
  console.log("server start at port 3001");
}
