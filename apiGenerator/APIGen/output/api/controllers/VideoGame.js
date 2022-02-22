'use strict';

var utils = require('../utils/writer.js');
var VideoGame = require('../service/VideoGameService');

module.exports.createVideoGame = function createVideoGame (req, res, next) {
  var videogame = req.swagger.params['videogame'].value;
  VideoGame.createVideoGame(videogame)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.deleteVideoGame = function deleteVideoGame (req, res, next) {
  var id = req.swagger.params['id'].value;
  VideoGame.deleteVideoGame(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getAllVideoGames = function getAllVideoGames (req, res, next) {
  var name = req.swagger.params['name'].value;
  var developer = req.swagger.params['developer'].value;
  var gamesystem = req.swagger.params['gamesystem'].value;
  var genre = req.swagger.params['genre'].value;
  var year = req.swagger.params['year'].value;
  var sort = req.swagger.params['sort'].value;
  VideoGame.getAllVideoGames(name,developer,gamesystem,genre,year,sort)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getOneVideoGameById = function getOneVideoGameById (req, res, next) {
  var id = req.swagger.params['id'].value;
  VideoGame.getOneVideoGameById(id)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.getVideogamesByDev = function getVideogamesByDev (req, res, next) {
  var developer = req.swagger.params['developer'].value;
  VideoGame.getVideogamesByDev(developer)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};

module.exports.updateVideoGame = function updateVideoGame (req, res, next) {
  var id = req.swagger.params['id'].value;
  var videogame = req.swagger.params['videogame'].value;
  VideoGame.updateVideoGame(id,videogame)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
