// SQL Lite https://www.sqlitetutorial.net/sqlite-nodejs
//
//ADD this command in ini miscreated script : start_server_core.cmd
//          start /wait <prog> : start /wait node E:/MiscreatedServer/0.customModsUpload/nodeUpdateVehicles/app.js   in start_server_core.cmd
//          Documentation : https://stackoverflow.com/questions/13257571/call-command-vs-start-with-wait-option


//Dependencies
const { db } = require('./sqllite_conn.js');

exports.{{{table_definition.crud_methods.get}}} = async (id) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let sql = `SELECT * FROM {{{table_definition.table}}} WHERE ID=?`;
        let params = [id];
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            resolve(result); 
        });           
    });
    //.then(() => {  });
}


exports.{{{table_definition.crud_methods.getAll}}} = async (limit = 0 ,offset = 50) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let sql = `SELECT * FROM {{{table_definition.table}}} LIMIT ?,?`;         
        let params = [limit,offset];
        db.get(sql, params, (err, result) => {
            if (err) reject(err);
            resolve(result); 
        });           
    });
    //.then(() => {  });
}


exports.{{{table_definition.crud_methods.create}}} = async ({{{mod_params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let sql = `INSERT INTO {{{table_definition.table}}} ({{{mod_params}}}) VALUES ({{{mod_query_number}}})`;
        let params = [{{{mod_params}}}];
        db.run(sql, params, function (err) {
            if (err) reject(err);            
            resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}


exports.{{{table_definition.crud_methods.update}}} = async ({{{table_definition.params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let sql = `UPDATE {{{table_definition.table}}} SET {{{mod_params_query}}} WHERE ID=?`;   
        let params = [{{{mod_params}}},{{{table_definition.pk}}}];
        db.run(sql, params, function (err) {
            if (err) reject(err);            
            resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}


exports.{{{table_definition.crud_methods.delete}}} = async (id) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let sql = `DELETE FROM {{{table_definition.table}}} WHERE id = ?`;   
        let params = [id];
        db.run(sql, params, function (err) {
            if (err) reject(err);            
            resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}

