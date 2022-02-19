
exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks        
        console.log("\x1b[32m", 'executing {{{method_name}}}.');
        {{{object_to_params}}}
        let sql = `DELETE FROM {{{sql_table}}} WHERE {{{sql_query_params}}}`;
        let params = [{{{sql_params}}}];
        db.run(sql, params, function (err) {            
            if (err) reject(err);            
            resolve({ deleted: this.changes} );
        });
    });
    //.then(() => {});
}