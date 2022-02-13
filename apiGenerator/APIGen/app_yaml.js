
var fs = require('fs');
var YAML = require('yaml');


const file = fs.readFileSync('./config/swagger.yaml', 'utf8');

let yaml = YAML.parse(file);


console.log(yaml);
console.log('*************************************\n**********************************\n HELLO : \n\n');
//console.log(yaml.paths['/hello'].get);

/* 
console.log(yaml.paths['/videogames/{id}'].put.parameters[0]);
console.log(yaml.paths['/videogames/{id}'].put.parameters[1]);
console.log(yaml.paths['/videogames/{id}'].put.parameters[1].definition.$ref); */
//console.log(yaml.paths['/Login'])

let paths = yaml.paths;
for (const path in yaml.paths) {
    console.log(path);
    let verbs = paths[path];
    for (const verb in verbs) {
        console.log(verb);
        let verb_properties = verbs[verb];
        console.log(verb_properties['x-swagger-router-controller']);
        console.log(verb_properties.operationId);
        let params = verb_properties.parameters;
        if (params) {
            for (const param in params) {
                console.log(' - ' + params[param].name);
                if (params[param].schema == null)
                    console.log('    - ' + params[param].type);
                else {
                    let definition = params[param].schema.$ref;
                    console.log('    - ' + definition);
                    definition = definition.substring(2, definition.length).replace('/', '.');
                    console.log('    - ' + definition);
                    let definition_paths = definition.split('.');
                    let object = yaml;
                    for (const definition_path in definition_paths) {
                        object = object[definition_paths[definition_path]];
                    }
                    //console.log(object.properties);   //console.log(yaml[arraydefinition[0]][arraydefinition[1]].properties );
                    let object_properties = object.properties
                    for (const object_property in object_properties) {
                        console.log('  -' + object_property);
                        console.log('    #' + object_properties[object_property].type);
                    }


                }
            }
        } else {
            console.log("no param");
        }
        console.log("-----------END---------------");
        /*  for (const param in tags){
             console.log(param);
             let method = tags[param]; 
     
             //console.log(method.operationId);           
         } */
    }
}


console.log(yaml.definitions.VideoGame.required);


