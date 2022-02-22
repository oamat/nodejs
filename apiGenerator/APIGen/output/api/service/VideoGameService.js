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
 const repository = require('../repositories/VideoGame.js');
 
exports.getAllVideoGames = async (name, developer, gamesystem, genre, year, sort) => {
    return new Promise( async (resolve, reject) => {
      console.log("\x1b[32m", 'executing getAllVideoGames Service.');
      let data = await repository.getAllVideoGames(name, developer, gamesystem, genre, year, sort);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": true});
          resolve(response);
        }
      });
}
exports.createVideoGame = async (videogame) => {
    return new Promise( async (resolve, reject) => {
      console.log("\x1b[32m", 'executing createVideoGame Service.');
      let data = await repository.createVideoGame(videogame);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": true});
          resolve(response);
        }
      });
}
exports.getOneVideoGameById = async (id) => {
    return new Promise( async (resolve, reject) => {
      console.log("\x1b[32m", 'executing getOneVideoGameById Service.');
      let data = await repository.getOneVideoGameById(id);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": true});
          resolve(response);
        }
      });
}
exports.updateVideoGame = async (id, videogame) => {
    return new Promise( async (resolve, reject) => {
      console.log("\x1b[32m", 'executing updateVideoGame Service.');
      let data = await repository.updateVideoGame(id, videogame);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": true});
          resolve(response);
        }
      });
}
exports.deleteVideoGame = async (id) => {
    return new Promise( async (resolve, reject) => {
      console.log("\x1b[32m", 'executing deleteVideoGame Service.');
      let data = await repository.deleteVideoGame(id);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": true});
          resolve(response);
        }
      });
}
exports.getVideogamesByDev = async (developer) => {
    return new Promise( async (resolve, reject) => {
      console.log("\x1b[32m", 'executing getVideogamesByDev Service.');
      let data = await repository.getVideogamesByDev(developer);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": true});
          resolve(response);
        }
      });
}
