var fs = require('fs')

let templateFile = "_scripts/docker-compose-template.yaml"
const finalFile = "_kubernetes/docker-compose.yaml"
const yaml = "/docker-compose.yaml";
const root = "/notifyPlatform/";
var template;

fs.readFile(root + templateFile, 'utf8', function (err, templateData) {
    if (err) {
        return console.log(err);
    } else {
        template = templateData;
        replace("_mongodb/mongosms", "mongosms");
        replace("_mongodb/mongopns", "mongopns");
        replace("_redis/redissms", "redissms");
        replace("_redis/redispns", "redispns");
        replace("collectors/pns/apple", "apple");
        replace("collectors/pns/google", "google");
        replace("collectors/pns/microsoft","microsoft" );
        replace("collectors/sms/movistar", "movistar");
        replace("collectors/sms/movistarvip", "movistarvip");
        replace("collectors/sms/vodafone", "vodafone");
        replace("collectors/sms/orange", "orange");
        replace("mq/mqsms", "mqsms");
        replace("mq/mqpns", "mqpns");
        replace("apis/apiadmin", "apiadmin");
        replace("apis/apisms", "apisms");
        replace("apis/apipns", "apipns");
        replace("apis/apistatus", "apistatus");
        replace("retries/retriessms", "retriessms");
        replace("retries/retriespns", "retriespns");
        console.log("docker-composer.yaml generated correctly");
    }

});


function replace(path, token) {
    fs.readFile(root + path + yaml, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            template = template.replace(":_" + token + "_:", data);
            fs.writeFile(root + finalFile, template, 'utf8', function (err) {
                if (err) console.log(err);
            });
        }
    });
}

