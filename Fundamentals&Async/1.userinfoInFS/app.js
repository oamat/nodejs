console.log('Starting app.');

const fs = require('fs');
const os = require('os');

var user = os.userInfo();

console.log(`Hello ${user.username}!`);
console.log(user);
fs.appendFile('greetings.txt', `Hello ${user.username}!`, (error) => { /* handle error */ });
