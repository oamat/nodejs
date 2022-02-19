/*
 * Redis configuration
 *
 */

//Dependencies
const sqlite3 = require('sqlite3').verbose();

var db;

const initDB = async () => {
    // open the database
    db = new sqlite3.Database('E:/dev/nodejs/nodejs/apiGenerator/APIGen/db/sqllite_db.db', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error("\x1b[31m", err.message);
        } else {
            console.log("\x1b[32m", 'Connected to the database.');
        }
    });
}

// Init and Create Client
initDB();


module.exports = { db };