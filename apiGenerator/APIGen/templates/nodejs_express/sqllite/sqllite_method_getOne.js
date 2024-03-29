
exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        console.log("\x1b[32m", 'executing {{{method_name}}}.');
        {{{object_to_params}}}
        let sql = `SELECT * FROM {{{sql_table}}} WHERE {{{sql_query_params}}}`;
        let params = [{{{sql_params}}}];
        db.get(sql, params, function (err, row) {
            if (err) reject(err); 
            resolve(row);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}
