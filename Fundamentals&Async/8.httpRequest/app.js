const request = require('request');

request({
  url: 'https://translate.google.es/#en/es/Hola',
  json: true
}, (error, response, body) => {
  console.log(body);
});
