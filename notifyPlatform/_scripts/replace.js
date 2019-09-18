var fs = require('fs')

let templateFile = "_scripts/docker-compose-template.yaml"
const finalFile = "_kubernetes/dockercompose/docker-compose.yaml"
const yaml = "/docker-compose.yaml";
const root = "/notifyPlatform/";
var template;

fs.readFile(root + templateFile, 'utf8', async function (err, templateData) {
    if (err) {
        return console.log(err);
    } else {
        template = templateData;
        await replace("_mongodb/mongosms", "mongosms");
        await replace("_mongodb/mongopns", "mongopns");
        await replace("_redis/redissms", "redissms");
        await replace("_redis/redispns", "redispns");
        await replace("_redis/redisconf", "redisconf");
        await replace("collectors/pns/apple", "apple");
        await replace("collectors/pns/google", "google");
        await replace("collectors/pns/microsoft", "microsoft");
        await replace("collectors/sms/movistar", "movistar");
        await replace("collectors/sms/movistarvip", "movistarvip");
        await replace("collectors/sms/vodafone", "vodafone");
        await replace("collectors/sms/orange", "orange");
        await replace("mq/mqsms", "mqsms");
        await replace("mq/mqpns", "mqpns");
        await replace("apis/apiadmin", "apiadmin");
        await replace("apis/apisms", "apisms");
        await replace("apis/apipns", "apipns");
        await replace("apis/apistatusback", "apistatusback");
        await replace("retries/retriessms", "retriessms");
        await replace("retries/retriespns", "retriespns");
        await replace("batch/batchsms", "batchsms");
        await replace("batch/batchpns", "batchpns");
        console.log("docker-composer.yaml generated correctly");
    }

});


async function replace(path, token) {
    fs.readFile(root + path + yaml, 'utf8', function (err, data) {
        if (err) {
            console.log(err);
        } else {
            data = data.replace('version: "3.1"', '');
            data = data.replace('services:', '');

            template = template.replace(":_" + token + "_:", data);

            fs.writeFile(root + finalFile, template, 'utf8', function (err) {
                if (err) console.log(err);
            });
        }
    });
}

