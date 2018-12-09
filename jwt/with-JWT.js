const jwt = require('jsonwebtoken');

var data = {
  id: 11,
  name: 'Oriol Sònia Ona Aina Núria',
  age: 40
};

var token = jwt.sign(data, 'secretpassword.User.Oriol');
console.log("token signed : " + token);

var decoded = jwt.verify(token, 'secretpassword.User.Oriol');
console.log('token decoded : ', decoded);

