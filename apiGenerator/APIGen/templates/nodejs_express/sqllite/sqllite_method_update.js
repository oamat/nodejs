
exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        {{{object_to_params}}}
        let sql = `UPDATE {{{sql_table}}} SET {{{sql_query_params}}} WHERE {{{sql_query_values}}}`;
        let params = [{{{sql_params}}}];
        db.run(sql, params, function (err, result) {            
            if (err) reject(err);            
            resolve(result);
            //resolve({ id: this.lastID });
        });
    });
    //.then(() => {});
}