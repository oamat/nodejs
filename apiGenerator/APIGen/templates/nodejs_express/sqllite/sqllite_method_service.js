exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise( async (resolve, reject) => {
      console.log("\x1b[32m", 'executing {{{method_name}}} Service.');
      let data = await repository.{{{method_name}}}({{{method_params}}});     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": true});
          resolve(response);
        }
      });
}
