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

exports.login = async (user, password) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        console.log("\x1b[32m", 'executing login.');
        
        let sql = `SELECT apikey FROM USERS WHERE user=? AND password=?`;
        let params = [user,password];
        db.all(sql, params, function (err, result) {
            if (err) reject(err);            
            resolve(result);
        });
    });
    //.then(() => {});
}