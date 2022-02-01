const sqlite3 = require('sqlite3').verbose();
const SQLLITE_FILE = "E:/MiscreatedServer/simplifiedMiscreatedServer/MiscreatedServer/miscreated.db"

// open a database connection
let db = new sqlite3.Database(SQLLITE_FILE);

//
let data = ['{"skin":"F46833A5","dieselfuel":110000,"oil":6000}', 38495];
let sql = `UPDATE Vehicles 
SET Data = ?
WHERE VehicleID=?`;

db.run(sql, data, function(err) {
  if (err) {
    return console.error(err.message);
  }
  console.log(`Row(s) updated: ${this.changes}`);

});

// close the database connection
db.close();