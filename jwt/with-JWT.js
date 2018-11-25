const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id: 10,
  name: 'Oriol Ona Aina Núria Sònia Oriol Ona Aina Núria Sònia Oriol Ona Aina Núria Sònia Oriol Ona Aina Núria Sònia Oriol Ona Aina Núria Sònia Oriol Ona Aina Núria Sònia Oriol Ona Aina Núria Sònia',
  age: 40
};

var token = jwt.sign(data, 'secretpassword.User.Oriol');
console.log("token signed : " + token);

var decoded = jwt.verify(token, 'secretpassword.User.Oriol');
console.log('token decoded : ', decoded);

