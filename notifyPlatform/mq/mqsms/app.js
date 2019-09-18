'use strict';

/*
 * This is a progran that get messages from an IBM MQ
 * queue using an asynchronous method.
 *
 * The queue and queue manager name can be given as parameters on the
 * command line or defaults are coded in the program.
 *
 * Each MQI save message in redis.
 */

// Dependencies

require('./config/config'); //we need configurations
const { initializeMongooseConnection } = require('./config/mongoosesms'); //we need to initialize mongoose
require('./config/redissms'); //we need to initialize redis
require('./config/redisconf'); //we need to initialize redis
const Sms = require('./models/sms');
const { saveSMS } = require('./util/mongosms');
const { lpush, sadd } = require('./util/redissms');
const { hget, hset } = require('./util/redisconf');
const { dateFormat, logTime, buildSMSChannel } = require('./util/formats');
const auth = require('./auth/auth');

// variables
var mq = require('ibmmq');
var MQC = mq.MQC; // Want to refer to this export directly for simplicity
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

// The default queue manager and queue to be used
var qMgr = "QM1";
var qName = "DEV.QUEUE.1";
var msgId = null;

// Some global variables
var connectionHandle;
var queueHandle;

var waitInterval = 3; // max seconds to wait for a new message
var ok = true;
var exitCode = 0;

const initializeAllSources = async () => { // Init Mongoose with await    
    //START PARALLEL excution with await Promise.all.
    await Promise.all([ //Async Promises: all tasks start immediately 
        initializeMongooseConnection(),  // Init mongoose
        hset("mqsms", "last", dateFormat(new Date())) //save last execution in Redis
    ]);
    //END PARALLEL excution with await Promise.all.

}

initializeAllSources(); //Init Mongoose & redis

/*
 * Format any error messages
 */
function formatErr(err) {
    if (err) {
        ok = false;
        return "MQ call failed at " + err.message;
    } else {
        return "MQ call successful";
    }
}

function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return bytes;
}


/*
 * Define which messages we want to get, and how.
 */
function getMessages() {
    var md = new mq.MQMD();
    var gmo = new mq.MQGMO();

    gmo.Options = MQC.MQGMO_NO_SYNCPOINT |
        MQC.MQGMO_WAIT |
        MQC.MQGMO_CONVERT |
        MQC.MQGMO_FAIL_IF_QUIESCING;
    gmo.MatchOptions = MQC.MQMO_NONE;
    gmo.WaitInterval = waitInterval * 1000; // 3 seconds

    if (msgId != null) {
        console.log( logTime(new Date()) + "Setting Match Option for MsgId");
        gmo.MatchOptions = MQC.MQMO_MATCH_MSG_ID;
        md.MsgId = hexToBytes(msgId);
    }

    // Set up the callback handler to be invoked when there
    // are any incoming messages. As this is a sample, I'm going
    // to tune down the poll interval from default 10 seconds to 0.5s.
    mq.setTuningParameters({ getLoopPollTimeMs: 500 });
    mq.Get(queueHandle, md, gmo, getCB);  //callback is getCB

}

/*
 * This function is the async callback. Parameters
 * include the message descriptor and the buffer containing
 * the message data.
 */
async function getCB(err, hObj, gmo, md, buf, hConn) {
    // If there is an error, prepare to exit by setting the ok flag to false.
    if (err) {
        if (err.mqrc == MQC.MQRC_NO_MSG_AVAILABLE) {
            console.log( logTime(new Date()) + "No more messages available.");
        } else {
            console.log(formatErr(err));
            exitCode = 1;
        }
        ok = false;
        // We don't need any more messages delivered, so cause the
        // callback to be deleted after this one has completed.
        mq.GetDone(hObj);
    } else {
        if (md.Format == "MQSTR") {
            let smsJSON = decoder.write(buf);
            console.log( logTime(new Date()) + "message <%s>", smsJSON);
            if (smsJSON) {
                try {
                    const sms = new Sms(JSON.parse(smsJSON)); // convert json to object,  await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
                    await auth(sms);                    
                    if (pns.priority < 1) pns.priority = 2; //only accept priorities 2,3,4,5 in MQ Service. (0,1 are reserved for REST interface).
                    sms.operator = await hget("contractsms:" + sms.contract, "operator"); //Operator by default by contract. we checked the param before (in auth)                    
                    sms.telf = sms.telf.replace("+", "00");
                    if (sms.operator == "ALL") { //If operator is ALL means that we need to find the better operator for the telf.            
                        sms.operator = await hgetOrNull("telfsms:" + sms.telf, "operator"); //find the best operator for this tef.         
                        if (!sms.operator) sms.operator = "MOV";  //by default we use MOV
                    }
                    const collectorOperator = hget("collectorsms:" + sms.operator, "operator"); //this method is Async, but we can get in parallel until need it (with await). 
                    if (await collectorOperator != sms.operator) sms.operator = collectorOperator;  //check if the operator have some problems

                    sms.channel = buildSMSChannel(sms.operator, sms.priority); //get the channel to put notification with operator and priority

                    delete pns.jwt; // we don't need to save jwt in mongodb, only for authoritation.
                    //await sms.validate(); //we need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.
                    //If you didn't execute "sms.validate()" we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors.
                    await saveSMS(sms) //save sms to DB, in this phase we need save SMS to MongoDB.//If you didn't execute "sms.validate()" we would need await in save.
                        .catch(error => {
                            error.message = "ERROR :  We cannot save notify in MongoBD. " + error.message;
                            throw error;
                        });

                    // START 2 "tasks" in parallel. Even when we recollect the errors we continue the execution and return OK.    
                    Promise.all([
                        lpush(sms.channel, JSON.stringify(sms)).catch(error => { return error }),  //put sms to the the apropiate lists channels: SMS.GOO.1, SMS.VIP.1, SMS.ORA.1, SMS.VOD.1 (1,2,3) 
                        sadd("SMS.IDS.PENDING", sms._id).catch(error => { return error }),         //we save the _id in a SET, for checking the retries, errors, etc.  
                    ]).then(values => {
                        if (values[0] instanceof Error) { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: We cannot save SMS in Redis LIST (lpush): " + values[0].message); }  //lpush returns error
                        if (values[1] instanceof Error) { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: We cannot save SMS in Redis SET (sadd): " + values[1].message); } //sadd returns error          
                    });
                    // END the 2 "tasks" in parallel    

                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS to send : " + sms._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string

                } catch (error) {
                    let contract = sms.contract || 'undefined';
                    let telf = sms.telf || 'undefined';
                    let message = sms.message || 'undefined';

                    const errorJson = { StatusCode: "SMS MQ ERROR", error: error.message, contract: contract, telf: telf, message: message, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: " + JSON.stringify(errorJson));
                    console.error(error); //continue the execution cron          
                    //TODO: save error in db  or mem.
                }
            }

        } else {
            console.log( logTime(new Date()) + "binary message: " + buf);
        }
    }
}

/*
 * When we're done, close any queues and connections.
 */
function cleanup(hConn, hObj) {
    mq.Close(hObj, 0, function (err) {
        if (err) {
            console.log(formatErr(err));
        } else {
            console.log( logTime(new Date()) + "MQCLOSE successful");
        }
        mq.Disc(hConn, function (err) {
            if (err) {
                console.log(formatErr(err));
            } else {
                console.log( logTime(new Date()) + "MQDISC successful");
            }
        });
    });
}

/**************************************************************
 * The program starts here.
 * Connect to the queue manager. If that works, the callback function
 * opens the queue, and then we can start to retrieve messages.
 */
console.log( logTime(new Date()) + "MQ client starts");

// Get command line parameters
var myArgs = process.argv.slice(2); // Remove redundant parms
if (myArgs[0]) {
    qName = myArgs[0];
}
if (myArgs[1]) {
    qMgr = myArgs[1];
}
if (myArgs[2]) {
    msgId = myArgs[2];
}

mq.setTuningParameters({ syncMQICompat: true });



mq.Conn(qMgr, function (err, hConn) { // Connect to the queue manager, including a callback function for when it completes.
    if (err) {
        console.log(formatErr(err));
        ok = false;
    } else {
        console.log( logTime(new Date()) + "MQCONN to %s successful ", qMgr);
        connectionHandle = hConn;

        // Define what we want to open, and how we want to open it.
        var od = new mq.MQOD();
        od.ObjectName = qName;
        od.ObjectType = MQC.MQOT_Q;
        var openOptions = MQC.MQOO_INPUT_AS_Q_DEF;
        mq.Open(hConn, od, openOptions, function (err, hObj) {
            queueHandle = hObj;
            if (err) {
                console.log(formatErr(err));
            } else {
                console.log( logTime(new Date()) + "MQOPEN of %s successful", qName);
                // And now we can ask for the messages to be delivered.
                getMessages();
            }
        });
    }
});

// We need to keep the program active so that the callbacks from the
// message handler are processed. This is one way to do it. Use the
// defined waitInterval with a bit extra added and look for the
// current status. If not OK, then close everything down cleanly.
setInterval(function () {
    if (!ok) {
        console.log( logTime(new Date()) + "Exiting ...");
        cleanup(connectionHandle, queueHandle);
        //process.exit(exitCode);
    }
}, (waitInterval + 2) * 1000);
