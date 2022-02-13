
exports.{{{new_method}}} = async ({{{params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        {{{object_to_params}}}let sql = {{{sql}}};
        let params = [{{{params}}}];
        db.run(sql, params, function (err) {
            if (err) reject(err);            
            resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}
