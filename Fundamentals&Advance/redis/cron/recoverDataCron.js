var cron = require('cron');
var redis = require('redis');

var CronJob = cron.CronJob;
var redisClient = redis.createClient({ host: '192.168.99.100', port: '6379' });
var id;

console.log('Before job instantiation');
const job = new CronJob('* * * * * *', function () {


    redisClient.lpop("list_channel", function (err, reply) {
        console.log("..........................");
        console.log("get & remove 1 id from id_channel, not from hash_channel");
        console.log("..........................");

        if (err) console.log(err); else {
            if (!reply) {
                console.log("No hay elementos en lista.");
            } else {
                console.log("lpop reply :" + reply);
                id = reply;


                redisClient.hget("hash_channel", id, function (err, reply) {
                    console.log("..........................");
                    console.log("recover json from hash_channel");
                    console.log("..........................");

                    if (err) console.log(err); else {
                        if (!reply) {
                            console.log("No existe el id en el hash.");
                        } else {
                            console.log("hget reply :" + reply);
                        }

                    }

                    console.log("..........................");
                    console.log("Do anything with json message...");
                    console.log("..........................");
                });

                redisClient.hdel("hash_channel", id, function (err, reply) {

                    console.log("..........................");
                    console.log("Remove json from hash_channel");
                    console.log("..........................");

                    if (err) console.log(err); else
                        console.log("hdel reply :" + reply);
                });


            }
        }
    });






});
console.log('After job instantiation');
job.start();