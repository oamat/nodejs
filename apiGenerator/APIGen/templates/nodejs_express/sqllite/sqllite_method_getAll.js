
exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        {{{object_to_params}}}
        let sql = `SELECT * FROM {{{sql_table}}} WHERE {{{sql_query_params}}}`;
        let params = [{{{sql_params}}}];
        db.get(sql, params, function (err) {
            if (err) reject(err); 
            resolve(result);           
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}
