
exports.{{{method}}} = function({{{params}}}) {
  return new Promise(function(resolve, reject) {
    let data = await repository.{{{method}}}({{{params}}});     
    if (data) {
      let response = utils.respondWithCode(200,data);    
      resolve(response);
    } else {
      let response = utils.respondWithCode(404,{"empty": false});
      resolve(response);
    }
  });
}

