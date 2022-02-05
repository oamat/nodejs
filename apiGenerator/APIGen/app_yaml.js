
var fs = require('fs');
var YAML = require('yaml');


const file = fs.readFileSync('./yamls/swagger.yaml', 'utf8');

let json = YAML.parse(file);


console.log(json);
console.log('*************************************\n**********************************\n HELLO : \n\n');
//console.log(json.paths['/hello'].get);


console.log(json.paths['/videogames/{id}'].put.parameters[0]);
console.log(json.paths['/videogames/{id}'].put.parameters[1]);
console.log(json.paths['/videogames/{id}'].put.parameters[1].schema.$ref);
console.log(json.definitions.VideoGame.required);


