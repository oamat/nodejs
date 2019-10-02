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
const { initializeMongooseConnection } = require('./config/mongoosepns'); //we need to initialize mongoose
require('./config/redispns'); //we need to initialize redis
require('./config/redisconf'); //we need to initialize redis
const Pns = require('./models/pns');
const { savePNS } = require('./util/mongopns');
const { rclient } = require('./config/redispns');
const { hgetConf, hset } = require('./util/redisconf');
const { dateFormat, logTime, buildPNSChannel } = require('./util/formats');
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
const PNS_IDS = "PNS.IDS.PENDING";
var connectionHandle;
var queueHandle;
var waitInterval = 3; // max seconds to wait for a new message
var ok = true;
var exitCode = 0;

const initializeAllSources = async () => { // Init Mongoose with await    
    //START PARALLEL excution with await Promise.all.
    await Promise.all([ //Async Promises: all tasks start immediately 
        initializeMongooseConnection(),  // Init mongoose
        hset("mqpns", "last", dateFormat(new Date())) //save last execution in Redis
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
        console.log(logTime(new Date()) + "Setting Match Option for MsgId");
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
            console.log(logTime(new Date()) + "No more messages available.");
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
            let pnsJSON = decoder.write(buf);
            console.log(logTime(new Date()) + "message <%s>", pnsJSON);
            if (pnsJSON) {
                try {
                    const pns = new Pns(JSON.parse(pnsJSON)); // convert json to object,  await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
                    await auth(pns);
                    if (pns.priority < 1) pns.priority = 2; //only accept priorities 2,3,4,5 in MQ Service. (0,1 are reserved for REST interface).

                    pns.token = await hget("tokenpns" + pns.application + ":" + pns.uuiddevice, "token"); //find the token for this uuiddevice PNS.
                    pns.operator = await hget("tokenpns" + pns.application + ":" + pns.uuiddevice, "operator"); //find the operator for this uuiddevice PNS.
                    if (!pns.token) throw new Error(" This uuiddevice is not register, we cannot find its token neither operator.") //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired, 5:token not found (not register)

                    pns.operator = await hgetConf("contractpns:" + pns.contract, "operator"); //Operator by default by contract. we checked the param before (in auth)                    
                    if (pns.operator == "ALL") { //If operator is ALL means that we need to find the better operator for the telf. 
                        //TODO: find the best operator for this tef. Not implemented yet
                        pns.operator = "GOO";
                    }
                    const collectorOperator = hgetConf("collectorpns:" + pns.operator, "operator"); //this method is Async, but we can get in parallel until need it (with await). 
                    if (await collectorOperator != pns.operator) pns.operator = collectorOperator;  //check if the operator have some problems

                    pns.channel = buildPNSChannel(pns.operator, pns.priority); //get the channel to put notification with operator and priority
                    delete pns.jwt; // we don't need to save jwt in mongodb, only for authoritation.

                    //await pns.validate(); //await pns.validate(); //validate is unnecessary, we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.

                    savePNS(pns) //save pns to DB, in this phase we need save PNS to MongoDB. //If you didn't execute "pns.validate()" we would need await in save.                    
                        .then(pns => {  //save method returns pns that has been save to MongoDB

                            //START Redis Transaction with multi chain and result's callback
                            rclient.multi([
                                ["lpush", pns.channel, JSON.stringify(pns)],    //Trans 1
                                ["sadd", PNS_IDS, pns._id]                      //Trans 2             
                            ]).exec(function (error, replies) { // drains multi queue and runs atomically                    
                                if (error) {
                                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: We couldn't save PNS in Redis (We will have to wait for retry): " + error.message);
                                }
                            });
                            //END Redis Transaction with multi chain and result's callback

                            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS saved, _id: " + pns._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                        })
                        .catch(error => {     // we need catch only if get 'await' out          
                            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: " + error.message);
                        });

                } catch (error) {
                    let contract = pns.contract || 'undefined';
                    let uuiddevice = pns.uuiddevice || 'undefined';
                    let content = pns.content || 'undefined';
                    let application = pns.application || 'undefined';
                    let action = pns.action || 'undefined';

                    const errorJson = { StatusCode: "MQ Error", error: error.message, contract: contract, uuiddevice: uuiddevice, application: application, action: action, content: content, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: " + JSON.stringify(errorJson));
                    console.error(error); //continue the execution cron          
                    //TODO: save error in db  or mem.
                }
            }

        } else {
            console.log(logTime(new Date()) + "binary message: " + buf);
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
            console.log(logTime(new Date()) + "MQCLOSE successful");
        }
        mq.Disc(hConn, function (err) {
            if (err) {
                console.log(formatErr(err));
            } else {
                console.log(logTime(new Date()) + "MQDISC successful");
            }
        });
    });
}

/**************************************************************
 * The program starts here.
 * Connect to the queue manager. If that works, the callback function
 * opens the queue, and then we can start to retrieve messages.
 */
console.log(logTime(new Date()) + "MQ client starts");

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
        console.log(logTime(new Date()) + "MQCONN to %s successful ", qMgr);
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
                console.log(logTime(new Date()) + "MQOPEN of %s successful", qName);
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
        console.log(logTime(new Date()) + "Exiting ...");
        cleanup(connectionHandle, queueHandle);
        //process.exit(exitCode);
    }
}, (waitInterval + 2) * 1000);
