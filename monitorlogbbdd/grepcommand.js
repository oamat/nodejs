var Client = require('ssh2').Client;

var conn = new Client();
conn.on('ready', function () {
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
            if (data.includes('Permission') || data.includes('denied') || data.includes('Access') ) {
                console.log('PROBLEM: ' + data);
            }
        });
        //stream.write('grep Peru usersProves.txt\n');
        stream.end('grep Peru usersProves.txt\nexit\n');
    });
}).connect({
    host: '192.168.1.90',
    port: 22,
    username: 'oriol',
    password: 'kireta'
});