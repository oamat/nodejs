var Client = require('ssh2').Client;

var conn = new Client();

conn.on('ready', function () {cd 
    console.log('Start Connection SSH.');
    conn.shell(function (err, stream) {
        if (err) throw err;
        stream.on('close', function () {
            console.log('Close Connection SSH.');
            conn.end();
        }).on('data', function (data) {
            console.log('OUTPUT: ' + data);
            if (!data.includes('grep ')) {
                if (data.includes('Peru')) {
                    console.log('FIND: ' + data);
                }
            }
            if (data.includes('Permission') || data.includes('denied') || data.includes('Access')) {
                console.log('PROBLEM: ' + data);
            }
        }).on('error', function (error) {
            console.log("error in command line server");
        });
        //stream.write('grep Peru usersProves.txt\n');
        stream.end('grep Peru usersProves.txt\nexit\n');
    });
}).on('error', function (error) {
    console.log("error initializating connection");
}).connect({
    host: '192.168.1.90',
    port: 22,
    username: '...',
    password: '...'
});



  // connectar-se des de un altre host: connection-hopping https://github.com/mscdex/ssh2#connection-hopping