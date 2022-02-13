
exports.getAllGameSystems = async (name, sort) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        
        let sql = `SELECT * FROM GameSystems WHERE name = ? AND sort = ?`;
        let params = [name, sort];
        db.get(sql, params, function (err) {
            if (err) reject(err); 
            resolve(result);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}

exports.createGameSystem = async (gamesystem) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        
        let name = gamesystem.name;
        let description = gamesystem.description;
        let image = gamesystem.image;
        let sql = `INSERT INTO GameSystems (name, description, image) VALUES (?, ?, ?)`;
        let params = [name, description, image];
        db.run(sql, params, function (err, result) {            
            if (err) reject(err);            
            resolve(result);
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}
exports.getOneGameSystemById = async (id) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        
        let sql = `SELECT * FROM GameSystems WHERE id = ?`;
        let params = [id];
        db.get(sql, params, function (err) {
            if (err) reject(err); 
            resolve(result);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}

exports.updateGameSystem = async (id, gamesystem) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        
        let name = gamesystem.name;
        let description = gamesystem.description;
        let image = gamesystem.image;
        let sql = `UPDATE GameSystems SET name = ?, description = ?, image = ? WHERE id = ?`;
        let params = [name, description, image, id];
        db.run(sql, params, function (err, result) {            
            if (err) reject(err);            
            resolve(result);
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}
exports.deleteGameSystem = async (id) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        
        let sql = `DELETE FROM GameSystems WHERE id = ?`;
        let params = [id];
        db.run(sql, params, function (err, result) {            
            if (err) reject(err);            
            resolve(result);
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}