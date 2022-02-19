
exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        console.log("\x1b[32m", 'executing {{{method_name}}}');
        {{{object_to_params}}}
        let sql = `INSERT INTO {{{sql_table}}} ({{{sql_query_params}}}) VALUES ({{{sql_query_values}}})`;
        let params = [{{{sql_params}}}];
        db.run(sql, params, function (err) {            
            if (err) reject(err);                     
            resolve({ id: this.lastID , created: this.changes});
        });
    });
    //.then(() => {});
}