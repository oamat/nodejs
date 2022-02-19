'use strict';

/**
 * Autogenerated Repository code by SnAPI framework - git:  https://github.com/oamat/nodejs
 *      SQL Lite Repository https://www.sqlitetutorial.net/sqlite-nodejs
 * 
 *
 * Author:  OAF 
 * git:  https://github.com/oamat/nodejs
 **/


//Dependencies
const { db } = require('./sqllite_conn.js');

exports.getAllGameSystems = async (name, sort) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        console.log("\x1b[32m", 'executing getAllGameSystems.');
        
        let sql = `SELECT * FROM GameSystems WHERE name = ? AND sort = ?`;
        let params = [name, sort];
        db.all(sql, params, function (err, results) {
            if (err) reject(err); 
            resolve(results);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}

exports.createGameSystem = async (gamesystem) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        console.log("\x1b[32m", 'executing createGameSystem');
        
        let name = gamesystem.name;
        let description = gamesystem.description;
        let image = gamesystem.image;
        let sql = `INSERT INTO GameSystems (name, description, image) VALUES (?, ?, ?)`;
        let params = [name, description, image];
        db.run(sql, params, function (err) {            
            if (err) reject(err);                     
            resolve({ id: this.lastID , created: this.changes});
        });
    });
    //.then(() => {});
}
exports.getOneGameSystemById = async (id) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        console.log("\x1b[32m", 'executing getOneGameSystemById.');
        
        let sql = `SELECT * FROM GameSystems WHERE id = ?`;
        let params = [id];
        db.get(sql, params, function (err, row) {
            if (err) reject(err); 
            resolve(row);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}

exports.updateGameSystem = async (id, gamesystem) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        console.log("\x1b[32m", 'executing updateGameSystem.');
        
        let name = gamesystem.name;
        let description = gamesystem.description;
        let image = gamesystem.image;
        let sql = `UPDATE GameSystems SET name = ?, description = ?, image = ? WHERE id = ?`;
        let params = [name, description, image, id];
        db.run(sql, params, function (err) {            
            if (err) reject(err);            
            resolve({ changed: this.changes });       
        });
    });
    //.then(() => {});
}
exports.deleteGameSystem = async (id) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        console.log("\x1b[32m", 'executing deleteGameSystem.');
        
        let sql = `DELETE FROM GameSystems WHERE id = ?`;
        let params = [id];
        db.run(sql, params, function (err) {            
            if (err) reject(err);            
            resolve({ deleted: this.changes} );
        });
    });
    //.then(() => {});
}