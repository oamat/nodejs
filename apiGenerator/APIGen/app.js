
var fs = require('fs');
var YAML = require('yaml');


const file = fs.readFileSync('./yamls/swagger.yaml', 'utf8');

let json = YAML.parse(file);


console.log(json);
console.log('*************************************\n**********************************\n HELLO : \n\n');
console.log(json.paths['/hello'].get);
