var redis = require("redis");
var pub = redis.createClient({ host: '192.168.99.100', port: '6379' });

console.log("puting 3 notifications with priority 1-online in Movistar channel");
pub.publish("1Online_Movistar_Channel", "I am sending Online message 1." );
pub.publish("1Online_Movistar_Channel", "I am sending Online message 2." );
pub.publish("1Online_Movistar_Channel", "I am sending Online message 3.");

console.log("puting 5 notifications with priority 2-MQ in Movistar channel");
pub.publish("2MQ_Movistar_Channel", "I am sending MQ message 1.");
pub.publish("2MQ_Movistar_Channel", "I am sending MQ message 2.");
pub.publish("2MQ_Movistar_Channel", "I am sending MQ message 3.");
pub.publish("2MQ_Movistar_Channel", "I am sending MQ message 4.");
pub.publish("2MQ_Movistar_Channel", "I am sending MQ message 5.");

console.log("puting 10 notifications with priority 3-Batch in Movistar channel");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 1.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 2.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 3.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 4.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 5.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 6.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 7.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 8.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 9.");
pub.publish("3Batch_Movistar_Channel", "I am sending Batch message 10.");




pub.quit(); 
