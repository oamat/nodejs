var fs = require('fs')

let templateFile = "scripts/docker-compose-template.yaml"
const finalFile = "kubernetes/docker-compose.yaml"
const yaml = "/docker-compose.yaml";
const path = "/oasis/";
let result;

fs.readFile(path + templateFile, 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    } else {        
        result = data;
        replace("apple");
        replace("google");
        replace("microsoft");
        replace("movistar",);
        replace("movistarvip",);
        replace("vodafone",);
        replace("orange",);
        replace("console");
        replace("mqsms");
        replace("mqpns");        
        replace("apisms");
        replace("apipns");
        replace("redisconf");
        replace("redissms");
        replace("redispns");
        replace("retriessms");
        replace("retriespns");
        replace("status");  
        console.log ("docker-composer.yaml generated correctly");      
    }

});


function replace(token) {
    fs.readFile(path + token + yaml, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        } else {
            result = result.replace(":_"+token+"_:", data);
            fs.writeFile(path + finalFile, result, 'utf8', function (err) {
                if (err) return console.log(err);
            });
        }
    });
}

