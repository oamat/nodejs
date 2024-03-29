const { exec } = require("child_process");
var fs = require('fs');
var path = require('path');

const Handlebars = require("handlebars");

var YAML = require('yaml');

// example names: 
//{{name_low}} = gamesystems
//{{name_1upper}} = Gamesystem
//{{name_1upper_plural}} = Gamesystems
//{{name_upper}} = GAMESYSTEM

const config_init = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
const config = JSON.parse(fs.readFileSync(config_init.json_config, 'utf8'));
const yaml = YAML.parse(fs.readFileSync(config_init.yaml_swagger, 'utf8'));

//LOAD YAML ARRAYS
var controllersList = new Set();
var arrayOperationsByController = [];
var arrayParamsByOperation = [];
var arrayObjectsByOperation = [];
var arrayAllSimpleParamsByController = [];
var arrayParamsByObject = [];

//LOAD JSON ARRAYS
var json_ControllersList = new Set();
var json_arrayOperationsByController = [];
var json_arrayTableByController = [];
var json_arrayConfigByOperationAndController = [];
var json_arrayParamCorrelationByController = [];

const crudMethod = new Set(["getOne", "getAll", "create", "update", "delete"]);


const init = () => {
  loadYaml();
  loadJSON();
  //copyFolderRecursiveSync('./api_generated/swagger/', './output/api/');

  let outputRepository = '';
  let outputService = '';
  let parameters = {};
  // agafo method, miro si és new o crud, reviso params i genero codi. 
  for (let controller of controllersList) { //iterate controllers API  
    outputRepository = getTemplate('sqllite_base_repository.js');
    parameters.controller = controller;
    parameters.repository_import = controller + '.js';
    outputService = getTemplate('sqllite_base_service.js', parameters);
    for (let method of arrayOperationsByController[controller]) { //iterate operations by controller
      //console.log("  -" + method);
      let controllerAndOperation = controller + '.' + method;
      if (json_arrayConfigByOperationAndController[controllerAndOperation]) {  //custom_methods 
        //console.log(json_arrayConfigByOperationAndController[controllerAndOperation]);
        //console.log(json_arrayConfigByOperationAndController[controllerAndOperation].method);

        if (json_arrayConfigByOperationAndController[controllerAndOperation].method != null
          && json_arrayConfigByOperationAndController[controllerAndOperation].sql != null
          && json_arrayConfigByOperationAndController[controllerAndOperation].sql_params != null
        ) {

          let arrayMethodParams = getMethodParams(method);
          parameters.method_name = json_arrayConfigByOperationAndController[controllerAndOperation].method
          parameters.method_params = arrayMethodParams[0];
          parameters.object_to_params = arrayMethodParams[1];
          checkCustomParams(arrayMethodParams[2], json_arrayConfigByOperationAndController[controllerAndOperation].sql_params); // we did in LoadJSON

          parameters.method_sql = json_arrayConfigByOperationAndController[controllerAndOperation].sql
          parameters.sql_params = json_arrayConfigByOperationAndController[controllerAndOperation].sql_params
          parameters.sql_get_or_run = getSqlType(json_arrayConfigByOperationAndController[controllerAndOperation].sql);
          outputRepository = outputRepository + getTemplate('sqllite_method_custom_' + parameters.sql_get_or_run + '.js', parameters);
          outputService = outputService + getTemplate('sqllite_method_service.js', parameters);

        } else {
          stopProgram("method:" + method + " is not a valid custom method, please check in config.json:custom_methods or change first words name in yaml:operationId for standard: getOne, getAll, create, update or delete.");
        }

      } else {           //CRUD method
        let type = method.substring(0, 6);
        //console.log(type);
        if (crudMethod.has(type)) {
          let arrayMethodParams = getMethodParams(method);
          parameters.method_name = method;
          parameters.method_params = arrayMethodParams[0];
          parameters.object_to_params = arrayMethodParams[1];
          let arraySqlQueryParams = getSqlQueryParams(type, arrayMethodParams[2], json_arrayTableByController[controller].pks.split(','), controller);
          parameters.sql_table = json_arrayTableByController[controller].table;
          parameters.sql_query_params = arraySqlQueryParams[0];
          parameters.sql_query_values = arraySqlQueryParams[1];
          parameters.sql_params = arraySqlQueryParams[2];
          outputRepository = outputRepository + getTemplate('sqllite_method_' + type + '.js', parameters);
          outputService = outputService + getTemplate('sqllite_method_service.js', parameters);
          //              parameters.sql_params = getSqlParams(); 


        } else {
          stopProgram("mehod:" + method + " it is not a CRUD method, it must to configure it in config.json:custom_methods or change first words name in yaml:operationId for standard: getOne, getAll, create, update or delete.");
        }

      }


    }
    writeRepo(controller, outputRepository);
    writeService(controller + 'Service', outputService);

  }
  writeConn();
  copyJsonConfig(); 
  copyYaml();
}

const checkCustomParams = (simpleparams, sql_params) => {
  let array_sql_params = sql_params.split(',');
  for (param of array_sql_params) {
    if (simpleparams.indexOf(param) < 0) {
      stopProgram("method:" + method + " is not a valid custom method, please check sql_parameters in config.json:custom_methods or change params in yaml operationId:" + method);
    }
  }

}

const getSqlType = (sql) => {
  let firstChar = sql.substring(0, 1).toUpperCase(); //Select, Delete, Insert or Update.
  switch (firstChar) {
    case 'S':
      return 'get';
    case 'D':
      return 'run';
    case 'I':
      return 'run';
    case 'U':
      return 'run';
    default:
      stopProgram("SQL:" + sql + " it is not valid, it must to configure correct SQL in config.json:custom_methods.");
  }
}

const getMethodParams = (method) => {

  let simple_params = [];
  let method_params = '';
  let object_to_params = '';

  let array_method_params = [];

  let setParams = arrayParamsByOperation[method];


  for (let param of setParams) {
    //console.log(param);
    if (param.substring(0, 1) == '#') {
      param = param.substring(1, param.length);
      array_method_params.push(param);
      const setObjectParams = arrayParamsByObject[param];
      let template_params = {};
      for (let object_param of setObjectParams) {
        simple_params.push(object_param);
        template_params.object_name = param;
        template_params.object_param = object_param;
        object_to_params = object_to_params + getTemplate('sqllite_object_to_var.js', template_params);
      }
    } else {
      simple_params.push(param);
      array_method_params.push(param);
    }
    //console.log("->" + param);
  }
  method_params = arrayToString(array_method_params, ', ');
  /*  console.log(object_to_params);
   console.log(method_params);
   console.log(simple_params); */
  return [method_params, object_to_params, simple_params];
}

const arrayToString = (array, regex) => {
  let str = array.toString();
  return str.replaceAll(',', regex);


}
const getTemplate = (template_name, params) => {
  let file = fs.readFileSync('./templates/' + config.language_type + '/' + config.persistence_type + '/' + template_name, 'utf8');
  let template = Handlebars.compile(file);
  return template(params);
}


const getSqlQueryParams = (type, params, pks, controller) => {
  let sql_query_params = '';
  let sql_params = '';
  let sql_query_values = '';//only for create or update

  let array_sql_params = [];
  let array_sql_query_params = [];
  let array_sql_query_values = [];
  let array_pks = [];

  switch (type) {
    case 'getOne':
      for (let index in params) {
        array_sql_query_params.push(changeSQLQueryCorrelation(controller, params[index]) + ' = ?');
      }
      sql_params = arrayToString(params, ', ');
      sql_query_params = arrayToString(array_sql_query_params, ' AND ');
      break;
    case 'getAll':
      for (let index in params) {
        array_sql_query_params.push(changeSQLQueryCorrelation(controller, params[index]) + ' = ?');
      }
      sql_query_params = arrayToString(array_sql_query_params, ' AND ');
      sql_params = arrayToString(params, ', ');
      break;
    case 'create':

      for (let index in params) {
        array_sql_query_values.push('?');
        array_sql_query_params.push(changeSQLQueryCorrelation(controller, params[index]));
      }
      sql_query_values = arrayToString(array_sql_query_values, ', ');
      sql_query_params = arrayToString(array_sql_query_params, ', ');
      sql_params = arrayToString(params, ', ');
      break;

    case 'update':

      for (let index in params) {

        if (pks.indexOf(params[index]) !== -1) {  //exist
          array_sql_query_values.push(params[index] + ' = ?');
          array_pks.push(params[index]);
        } else {
          array_sql_query_params.push(changeSQLQueryCorrelation(controller, params[index]) + ' = ?');
          array_sql_params.push(params[index]);
        }
      }
      sql_query_params = arrayToString(array_sql_query_params, ', ');
      sql_query_values = arrayToString(array_sql_query_values, ', ');
      array_sql_params.push(array_pks);
      sql_params = arrayToString(array_sql_params, ', ');
      break;
    case 'delete':
      for (let index in params) {
        array_sql_query_params.push(changeSQLQueryCorrelation(controller, params[index]) + ' = ?');
      }
      sql_query_params = arrayToString(array_sql_query_params, ' AND ');
      sql_params = arrayToString(params, ', ');
      break;
    default:
      stopProgram('\x1b[31m', "type method:" + type + " it is not valid, it must to configure correct method in yaml:operationId.");
  }

  //console.log(sql_query_params);
  return [sql_query_params, sql_query_values, sql_params];
}

const changeSQLQueryCorrelation = (controller, param) => {
  if (json_arrayParamCorrelationByController[controller])
    if (json_arrayParamCorrelationByController[controller][param])
      param = json_arrayParamCorrelationByController[controller][param];

  //console.log(controller + " : " + param);
  return param;

}

const stopProgram = (error) => {
  console.error('\x1b[31m', error);
  process.exit();
}

const prepareParams = (mod_params, pk) => {
  let array_mod_params = mod_params.split(',');
  let array_mod_query_number = [];
  let array_mod_params_query = [];
  let index_to_remove = -1;

  for (let index in array_mod_params) {
    if (array_mod_params[index] == pk) {
      index_to_remove = index;
    } else {
      array_mod_query_number.push("?");
      array_mod_params_query.push(array_mod_params[index] + '=?');
    }
  }

  if (index_to_remove != -1) array_mod_params.splice(index_to_remove, 1);

  return [array_mod_params, array_mod_params_query, array_mod_query_number];
}

const checkFolders = () => {

  checkFolder('./output/');
  checkFolder('./output/api/');
  checkFolder('./output/api/api/');
  checkFolder('./output/api/config/');
  checkFolder('./output/api/api/swagger/');
  checkFolder('./output/api/repositories/');
  checkFolder('./output/api/service/');

}

const checkFolder = (folder) => {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

const writeRepo = (file_name, output) => {
  checkFolders();
  let file_path = './output/api/repositories/' + file_name + '.js';
  fs.writeFile(file_path, output, function (err) {
    if (err) return console.log(err);
    console.log('generated template > ' + file_path);
  });

}

const writeService = (file_name, output) => {
  checkFolders();
  let file_path = './output/api/service/' + file_name + '.js';
  fs.writeFile(file_path, output, function (err) {
    if (err) return console.log(err);
    console.log('generated template > ' + file_path);
  });
}

const writeConn = () => {
  let parameters = {};
  parameters.database_path = config.db_properties.path;
  let output = getTemplate('sqllite_conn.js', parameters);

  let file_path = './output/api/repositories/sqllite_conn.js';
  fs.writeFile(file_path, output, function (err) {
    if (err) return console.log(err);
    console.log('generated template > ' + file_path);
  });

}


const copyYaml = () => {
  let file_path_destination = './output/api/api/swagger.yaml'
  let file_path_destination_too = './output/api/api/swagger/swagger.yaml'
  let file_path_source = config_init.yaml_swagger;


  fs.copyFile(file_path_source, file_path_destination, (err) => {
    if (err) throw err;
    console.log('copy depedency > ' + file_path_destination);
  });

  fs.copyFile(file_path_source, file_path_destination_too, (err) => {
    if (err) throw err;
    console.log('copy depedency > ' + file_path_destination_too);
  });

}


const copyJsonConfig = () => {
  let file_path_destination = './output/api/config/config.json'
  let file_path_source = config_init.json_config;


  fs.copyFile(file_path_source, file_path_destination, (err) => {
    if (err) throw err;
    console.log('copy depedency > ' + file_path_destination);
  }); 
}


const loadYaml = () => {

  let paths = yaml.paths;
  for (let path in yaml.paths) {
    //console.log(path);
    let verbs = paths[path];
    for (let verb in verbs) {
      //console.log(verb);
      let verb_properties = verbs[verb];
      //console.log(verb_properties['x-swagger-router-controller']);
      if (verb_properties['x-swagger-router-controller'] != null) {
        let controller = verb_properties['x-swagger-router-controller'];
        let operation = verb_properties.operationId;
        controllersList.add(controller);

        //console.log(operation);
        saveInSetIntoArray(arrayOperationsByController, controller, operation);

        let params = verb_properties.parameters;
        if (params) {
          for (let param in params) {

            if (params[param].schema == null) {
              //console.log('    - ' + params[param].type);
              //console.log('    - ' + params[param].name);        
              saveInSetIntoArray(arrayParamsByOperation, operation, params[param].name);
              saveInSetIntoArray(arrayAllSimpleParamsByController, controller, params[param].name);

            } else {
              let object_name = params[param].name; //complex object with reference
              saveInSetIntoArray(arrayParamsByOperation, operation, '#' + object_name);
              saveInSetIntoArray(arrayObjectsByOperation, operation, object_name);

              let definition = params[param].schema.$ref;
              //console.log('    - ' + definition);
              definition = definition.substring(2, definition.length).replace('/', '.');
              //console.log('    - ' + definition);
              let definition_paths = definition.split('.');
              let object = yaml;
              for (let definition_path in definition_paths) {
                object = object[definition_paths[definition_path]];
              }
              //console.log(object.properties);   //console.log(yaml[arraydefinition[0]][arraydefinition[1]].properties );
              let object_properties = object.properties
              for (let object_property in object_properties) {
                //console.log('  -' + object_property);
                //console.log('    #' + object_properties[object_property].name);
                saveInSetIntoArray(arrayParamsByObject, object_name, object_property);
                saveInSetIntoArray(arrayAllSimpleParamsByController, controller, object_property);

              }
            }
          }
        } else {
          console.log("---NO PARAM---");
        }
      }
    }
  }
  /*   console.log(controllersList);
    console.log(arrayOperationsByController);
    console.log(arrayParamsByOperation);
    console.log(arrayObjectsByOperation);
    console.log(arrayParamsByObject);
   */
}


const loadJSON = () => {
  let definitions = config.definitions;
  for (let definition in definitions) {
    let definition_properties = definitions[definition];
    let controller = definition_properties['x-swagger-router-controller'];
    //console.log(controller);
    if (controllersList.has(controller)) {
      json_ControllersList.add(controller);
      json_arrayTableByController[controller] = definitions[definition].table_definition;
      let correlations = json_arrayTableByController[controller].table_columns_correlation;
      if (Object.keys(correlations).length != 0) { //we have column correlations and we have to check
        //console.log("correlations : " + controller);
        //console.log(json_arrayTableByController[controller].table_columns_correlation);
        for (let column in correlations) {
          //console.log(`${column}: ${correlations[column]}`);
          if (arrayAllSimpleParamsByController[controller].has(column)) {
            if (json_arrayParamCorrelationByController[controller] == null) json_arrayParamCorrelationByController[controller] = {};
            json_arrayParamCorrelationByController[controller][column] = correlations[column];
            //console.log(json_arrayParamCorrelationByController[controller])
          } else {
            stopProgram("Controller:" + controller + " doesn't have this column " + column + " in table associated, please check swagger or config.json");
          }
        }
      }

      json_arrayOperationsByController[controller] = new Set();
      let custom_methods = definitions[definition].custom_methods;
      if (custom_methods.length > 0) {
        for (let index in custom_methods) {
          let operation = custom_methods[index].method;
          if (arrayOperationsByController[controller].has(operation)) {
            json_arrayOperationsByController[controller].add(operation);
            let controllerAndOperation = controller + '.' + operation;
            json_arrayConfigByOperationAndController[controllerAndOperation] = custom_methods[index]; //we always have 1 json in controllerAndOperation key    
          } else {
            stopProgram("method:" + operation + " in controller " + controller + " is not a valid custom method because it doesn't exist in YAML, please remove method from config.json:custom_methods or add the method in yaml operationId in controller:" + controller);
          }

        }
      }
    } else {
      stopProgram("Controller:" + controller + " doesn't exist in swagger yaml, please check swagger or config.json");
    }
  }
  /*      console.log(json_arrayOperationsByController);
       console.log(json_arrayTableByController);
      console.log(json_arrayConfigByOperationAndController);  */
}

const saveInSetIntoArray = (array, key, object) => {
  if (array[key] != null) {
    array[key].add(object);
  } else {
    array[key] = new Set();
    array[key].add(object);
  }
  return array;
}




function copyFolderRecursiveSync(sourceFolder, finalFolder) {
  var files = [];

  fs.rmSync(finalFolder, { recursive: true, force: true });
  checkFolder(finalFolder);

  // Copy
  if (fs.lstatSync(sourceFolder).isDirectory()) {
    files = fs.readdirSync(sourceFolder);
    files.forEach(function (file) {
      let fileSourcePath = path.join(sourceFolder, file);
      let fileFinalPath = path.join(finalFolder, file);
      if (fs.lstatSync(fileSourcePath).isDirectory()) {
        checkFolder(fileFinalPath); //create folder in destiny
        copyFolderRecursiveSync(fileSourcePath, fileFinalPath);
      } else {
        let output = fs.readFileSync(fileSourcePath);
        fs.writeFileSync(fileFinalPath, output, function (err) {
          if (err) return console.log(err);
        });
      }
    });
  } else {
    stopProgram("file:" + sourceFolder + " must to be a folder.");
  }
}

const generatedSwagger = () => {

  exec('./generateSwagger.ps1', { 'shell': 'powershell.exe' }, (error, stdout, data) => {
    if (error) {
      stopProgram(error + stdout);
    } else {
      console.log(data + stdout);
      exec('./copyFolder.ps1', { 'shell': 'powershell.exe' }, (error, stdout, data) => {        
        if (error) {
          stopProgram(error + stdout);
        } else {   
          console.log(data + stdout);          
         //copyFolderRecursiveSync('./api_generated/','./output/api/');        
         init();              
        }      
      });
    
    }
  
  });
}

generatedSwagger();
