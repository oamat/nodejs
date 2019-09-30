const fs = require('fs');
const https = require('https');

//VAR & CONST
const httpsServerOptions = {
     'key': fs.readFileSync('./ssl/server.key'),
     'cert': fs.readFileSync('./ssl/server.cert')
};
//SERVER ON PORT 30010 
https.createServer( httpsServerOptions ,function (req, res) {
  res.write('ok'); //write a response
  res.end(); //end the response
}).listen(30010, function () {
  console.log("HTTPS Server Dummy for Collectors start at port 30010"); //the server object listens on port 30010
});