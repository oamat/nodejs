const {SHA256} = require('crypto-js');

var data = {
  id: 11,
  name: 'Oriol Sònia Ona Aina Núria',
  age: 40,
  iat: "timestamp required"
};

var hash = SHA256(data).toString();

var token = {
  data,
  hash: (hash + '.somesecret').toString()
}




console.log("Hash: " + token.hash);
console.log("Message: " + JSON.stringify(token.data));

console.log("---------------------------------------------------------------------------------------");
console.log("---------------------------------------------------------------------------------------");

console.log(" Token :");
console.log(token);
// this code provoques Error, we change data
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();


console.log("---------------------------------------------------------------------------------------");
console.log("---------------------------------------------------------------------------------------");


var resultHash = SHA256(token.data).toString() + '.somesecret';

if (resultHash === token.hash) {
  console.log('Data was not changed');
} else {
  console.log('Data was changed. Do not trust!');
}
