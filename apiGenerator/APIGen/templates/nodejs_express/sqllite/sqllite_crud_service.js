'use strict';

//Dependencies
const utils = require('../utils/writer.js');
const repository = require('../repositories/{{{repo_file}}}');

exports.{{{table_definition.crud_methods.get}}} = async (id) => {
    return new Promise((resolve, reject) => {
        let data = await repository.{{{table_definition.crud_methods.get}}}(id);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}


exports.{{{table_definition.crud_methods.getAll}}} = async (limit = 0 ,offset = 50) => {
    return new Promise((resolve, reject) => {
        let data = await repository.{{{table_definition.crud_methods.getAll}}}(limit,offset);      
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}


exports.{{{table_definition.crud_methods.create}}} = async ({{{mod_params}}}) => {
    return new Promise((resolve, reject) => {
        let data = await repository.{{{table_definition.crud_methods.create}}}({{{mod_params}}});     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}


exports.{{{table_definition.crud_methods.update}}} = async ({{{table_definition.params}}}) => {
    return new Promise((resolve, reject) => {
        let data = await repository.{{{table_definition.crud_methods.update}}}({{{table_definition.pk}}},{{{mod_params}}});     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}


exports.{{{table_definition.crud_methods.delete}}} = async (id) => {
    return new Promise((resolve, reject) => {
        let data = await repository.{{{table_definition.crud_methods.delete}}}(id);     
        if (data) {
          let response = utils.respondWithCode(200,data);    
          resolve(response);
        } else {
          let response = utils.respondWithCode(404,{"empty": false});
          resolve(response);
        }
      });
}

