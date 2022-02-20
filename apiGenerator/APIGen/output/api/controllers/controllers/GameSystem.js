'use strict';

var utils = require('../utils/writer.js');
var GameSystem = require('../service/GameSystemService');

module.exports.createGameSystem = function createGameSystem (req, res, next) {
  var gamesystem = req.swagger.params['gamesystem'].value;
  GameSystem.createGameSystem(gamesystem)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteGameSystem = function deleteGameSystem (req, res, next) {
  var id = req.swagger.params['id'].value;
  GameSystem.deleteGameSystem(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAllGameSystems = function getAllGameSystems (req, res, next) {
  var name = req.swagger.params['name'].value;
  var sort = req.swagger.params['sort'].value;
  GameSystem.getAllGameSystems(name,sort)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getOneGameSystemById = function getOneGameSystemById (req, res, next) {
  var id = req.swagger.params['id'].value;
  GameSystem.getOneGameSystemById(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.updateGameSystem = function updateGameSystem (req, res, next) {
  var id = req.swagger.params['id'].value;
  var gamesystem = req.swagger.params['gamesystem'].value;
  GameSystem.updateGameSystem(id,gamesystem)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
