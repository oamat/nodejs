var Client = require('ssh2').Client;
 
var conn = new Client();
conn.on('ready', function() {
  console.log('Start Connection SSH.');
  conn.shell(function(err, stream) {
    if (err) throw err;
    stream.on('close', function() {
      console.log('Close Connection SSH.');
      conn.end();
    }).on('data', function(data) {
      console.log('OUTPUT: ' + data);
    });
    stream.end('cd proves\nls -l\nexit\n');
  });
}).connect({
    host: '192.168.1.90',
    port: 22,
    username: '...',  
    password: '...'
  });

  // connectar-se des de un altre host: connection-hopping https://github.com/mscdex/ssh2#connection-hopping