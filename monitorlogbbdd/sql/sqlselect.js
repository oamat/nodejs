/* node-oracledb : 
https://oracle.github.io/node-oracledb/doc/api.html#getstarted
https://github.com/oracle/node-oracledb/blob/master/examples/example.js#L32 */

const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;


async function run() {

  let connection;

  try {
    connection = await oracledb.getConnection(  {
      user          : "user",
      password      : "password",
      connectString : "localhost/XEPDB1"
    });

    const result = await connection.execute(
      `SELECT manager_id, department_id, department_name
       FROM departments
       WHERE manager_id = :id`,
      [103],  // bind value for :id
    );
    console.log(result.rows);

  } catch (err) {
    console.error(err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

run();
