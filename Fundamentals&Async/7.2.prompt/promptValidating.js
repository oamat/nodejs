const prompt = require('prompt');

const properties = [
    {
        name: 'username',
        description: 'Your username',
        validator: /^[a-zA-Z\s\-]+$/,
        warning: 'Username must be only letters, spaces, or dashes',
        required:true
    },
    {
        name: 'password',
        description: 'Your password',
        warning: 'You must introduce password',
        hidden: true,
        required:true
    },
    {
        name: 'where',
        description: 'Where do you live?',        
        required:true
    }
];

prompt.start();

prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }
    console.log('Command-line input received:');
    console.log('  Username: ' + result.username);
    console.log('  Password: ' + result.password);
    console.log('  You live: ' + result.where);
});

function onErr(err) {
    console.log(err);
    return 1;
}