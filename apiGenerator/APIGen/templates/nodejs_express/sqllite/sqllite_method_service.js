exports.{{{method_name}}} = async ({{{method_params}}}) => {
    return new Promise((resolve, reject) => {
        let data = await repository.{{{method_name}}}({{{method_params}}});     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}
