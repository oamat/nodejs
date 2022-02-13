/*
 * Redis configuration
 *
 */

//Dependencies
const sqlite3 = require('sqlite3').verbose();


const initDB = async () => {
    // open the database
    let db = new sqlite3.Database({{{database_pah}}}, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
    return db;
}

// Init and Create Client
const db = initDB();


module.exports = { db };