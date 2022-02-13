
exports.{{{method}}} = async ({{{params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let sql = '{{{sql}}}';
        let params = [{{{params}}}];
        db.{{{type}}}(sql, params, (err, result) => {
            if (err) reject(err);
            resolve(result); 
        });           
    });
    //.then(() => {  });
}