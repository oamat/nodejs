'use strict';

var utils = require('../utils/writer.js');
var Login = require('../service/LoginService');

module.exports.login = function login (req, res, next) {
  var user = req.swagger.params['user'].value;
  var password = req.swagger.params['password'].value;
  Login.login(user,password)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
