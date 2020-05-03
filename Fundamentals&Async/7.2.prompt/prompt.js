const prompt = require('prompt');

prompt.start();

prompt.get(['username', 'email', 'where'], function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Email: ' + result.email);
    console.log('  you live: ' + result.where);
});

function onErr(err) {
    console.log(err);
    return 1;
}