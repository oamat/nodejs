
exports.getAllVideoGames = async (name, developer, gamesystem, genre, year, sort, fields) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        
        let sql = `SELECT * FROM VideoGames WHERE name = ? AND developer = ? AND gamesystem = ? AND genre = ? AND year = ? AND sort = ? AND fields = ?`;
        let params = [name, developer, gamesystem, genre, year, sort, fields];
        db.get(sql, params, function (err) {
            if (err) reject(err); 
            resolve(result);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}

exports.createVideoGame = async (videogame) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        
        let name = videogame.name;
        let developer = videogame.developer;
        let gamesystem = videogame.gamesystem;
        let genre = videogame.genre;
        let year = videogame.year;
        let image = videogame.image;
        let sql = `INSERT INTO VideoGames (name, developer, gamesystem, genre, year, image) VALUES (?, ?, ?, ?, ?, ?)`;
        let params = [name, developer, gamesystem, genre, year, image];
        db.run(sql, params, function (err, result) {            
            if (err) reject(err);            
            resolve(result);
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}
exports.getOneVideoGameById = async (id) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        
        let sql = `SELECT * FROM VideoGames WHERE id = ?`;
        let params = [id];
        db.get(sql, params, function (err) {
            if (err) reject(err); 
            resolve(result);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}

exports.updateVideoGame = async (id, videogame) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        
        let name = videogame.name;
        let developer = videogame.developer;
        let gamesystem = videogame.gamesystem;
        let genre = videogame.genre;
        let year = videogame.year;
        let image = videogame.image;
        let sql = `UPDATE VideoGames SET name = ?, developer = ?, gamesystem = ?, genre = ?, year = ?, image = ? WHERE id = ?`;
        let params = [name, developer, gamesystem, genre, year, image, id];
        db.run(sql, params, function (err, result) {            
            if (err) reject(err);            
            resolve(result);
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}
exports.deleteVideoGame = async (id) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        
        let sql = `DELETE FROM VideoGames WHERE id = ?`;
        let params = [id];
        db.run(sql, params, function (err, result) {            
            if (err) reject(err);            
            resolve(result);
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}