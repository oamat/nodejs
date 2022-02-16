'use strict';

/**
 * Autogenerated Service code by SnAPI framework - git:  https://github.com/oamat/nodejs
 *      SQL Lite Repository https://www.sqlitetutorial.net/sqlite-nodejs
 * 
 *
 * Author:  OAF 
 * git:  https://github.com/oamat/nodejs
 **/

 //Dependencies
 const utils = require('../utils/writer.js');
 const repository = require('../repositories/');
 
exports.getAllVideoGames = async (name, developer, gamesystem, genre, year, sort, fields) => {
    return new Promise((resolve, reject) => {
        let data = await repository.getAllVideoGames(name, developer, gamesystem, genre, year, sort, fields);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}
exports.createVideoGame = async (videogame) => {
    return new Promise((resolve, reject) => {
        let data = await repository.createVideoGame(videogame);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}
exports.getOneVideoGameById = async (id) => {
    return new Promise((resolve, reject) => {
        let data = await repository.getOneVideoGameById(id);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}
exports.updateVideoGame = async (id, videogame) => {
    return new Promise((resolve, reject) => {
        let data = await repository.updateVideoGame(id, videogame);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}
exports.deleteVideoGame = async (id) => {
    return new Promise((resolve, reject) => {
        let data = await repository.deleteVideoGame(id);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}
