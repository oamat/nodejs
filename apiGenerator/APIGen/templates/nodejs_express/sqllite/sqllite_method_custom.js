
exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        {{{object_to_params}}}
        let sql = `{{{method_sql}}}`;
        let params = [{{{sql_params}}}];
        db.{{{sql_get_or_run}}}(sql, params, function (err) {
            if (err) reject(err);            
            resolve(result);
        });
    });
    //.then(() => {});
}