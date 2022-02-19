
exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        console.log("\x1b[32m", 'executing {{{method_name}}}.');
        {{{object_to_params}}}
        let sql = `SELECT * FROM {{{sql_table}}} WHERE {{{sql_query_params}}}`;
        let params = [{{{sql_params}}}];
        db.all(sql, params, function (err, results) {
            if (err) reject(err); 
            resolve(results);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}
