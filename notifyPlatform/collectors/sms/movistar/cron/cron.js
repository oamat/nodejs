

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const { Sms } = require('../models/sms');
const { rpop, lpush, sismember } = require('../util/redissms'); //we need to initialize redis
const { hset, hgetall } = require('../util/redisconf');
const { dateFormat, logTime, buildSMSChannel, buildSMSChannels } = require('../util/formats'); // utils for formats
const { updateSMS } = require('../util/mongosms'); //for updating status
const { sendSMS } = require('./smsSendMOV');


//Variables
const SMS_IDS = "SMS.IDS.PENDING";
const defaultOperator = "MOV"; //default operator for this collector: "MOV"
const defaultCollector = "collectorsms:" + defaultOperator; // default collector, for configurations
const channels = buildSMSChannels(defaultOperator); //Channels to receive SMS request always are the same.

var operator = defaultOperator; //default operator for this collector: "MOV"
var cronConf; //the redis cron configuration 
var cron; //the main cron that send message to the operator.
var cronController;  //the Controller cron that send message to the operator.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron,  we use this control var
var cronControllerChange = false; //if we need restart cron, we use this control var
var interval = 10; //define the rate/s notifications, interval in cron (100/s by default)
var intervalControl = 60000; //define interval in controller cron (check by min. by default)


const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing MOVISTAR cronMain at " + dateFormat(new Date()) + " with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "MOVISTAR cronMain is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "MOVISTAR cron executing ");
                sendNextSMS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start MOVISTAR cron." + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping MOVISTAR cronMain at " + dateFormat(new Date()));
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop MOVISTAR cronMain. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const sendNextSMS = async () => {
    try {
        const smsJSON = await nextSMS(); //get message with rpop command from SMS.MOV.1, 2, 3 
        if (smsJSON) {
            const sms = new Sms(JSON.parse(smsJSON)); //EXPIRED // convert json text to json object   
            if ((sms.expire) && (Date.now() > sms.expire)) { // is the SMS expired?
                sms.expired = true;
                sms.status = 4; //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired
                updateSMS(sms).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message) }); //update SMS in MongoDB, is the last task, it's unnecessary await
                console.log(process.env.YELLOW_COLOR, logTime(new Date()) + " The SMS " + sms._id + " has expired and has not been sent.");
            } else {
                //sms.validate(); //It's unnecessary because we cautched from redis, and we checked before in the apisms, the new params are OK.
                if (operator == defaultOperator) { //MOVISTAR WILL SEND //If we change operator for contingency we change sms to other list
                    sms.status = await sendSMS(sms); // send SMS to operator, //return status: 0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired   
                    sms.retries++;
                    sms.dispatched = true;
                    sms.dispatchedAt = new Date();
                    Promise.all([ //Always we need delete ID in SMS_IDS SET, in error case we continue
                        updateSMS(sms).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), // update SMS in MongoDB, in error case we continue
                        sismember(SMS_IDS, sms._id).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //delete from redis ID control, in error case we continue
                    ]).then(() => { //we always enter here
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS sended : " + sms._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                    });
                } else { //CONTINGENCY //In this case we don't delete ID in SMS_IDS SET.
                    sms.operator = operator; //The real operator to we will send SMS message      
                    sms.channel = buildSMSChannel(operator, sms.priority); //The real channel we will send SMS message
                    await lpush(sms.channel, JSON.stringify(sms)); // we put message to the other operator List
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "change SMS " + sms._id + " from " + defaultOperator + " to " + operator); // we inform about this exceptional action
                }
            }
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in MOVISTAR cronMain sendNextSMS() : " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const nextSMS = async () => {
    try {
        return await rpop(channels.channel0) || await rpop(channels.channel1) || await rpop(channels.channel2) || await rpop(channels.channel3) || await rpop(channels.channel4) || await rpop(channels.channel5); //return the next sms by priority order.  
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem with redis rpop : " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing cronController at " + dateFormat(new Date()) + " with intervalControl : " + intervalControl);
        hset(defaultCollector, "last", dateFormat(new Date())); //save first execution in Redis
        if (cronController) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "MOVISTAR cronController is executing, so we don't need re-start it.");
        } else {
            cronController = setInterval(function () {
                checksController();
            }, intervalControl);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start cron Controller. . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const checksController = async () => {
    try {
        cronConf = await hgetall(defaultCollector); //get the cronConf
        Promise.all([ //In error case we continue with other tasks
            hset(defaultCollector, "last", dateFormat(new Date())).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }),  //save last execution in Redis, in error case we continue
            checkstatus(parseInt(cronConf.status)).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check status in Redis, in error case we continue
            checkInterval(parseInt(cronConf.interval)).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check interval in Redis, in error case we continue
            checkOperator(cronConf.operator).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }),
            checkIntervalControl(parseInt(cronConf.intervalControl)).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //check operator in Redis, in error case we continue
        ]).then(async () => {
            // Cron Main Check
            if (cronChanged) { //some param changed in cron, we need to restart or stopped.
                if (cronStatus) { //cron must to be started                       
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Stopping and Re-Starting MOVISTAR cronMain...");
                    cronChanged = false;
                    await stopCron();
                    await startCron(interval);
                } else { //cron must to be stopped            
                    cronChanged = false;
                    await stopCron(); //if I stop cron N times, it doesn't matter... 
                }
            }
            // Cron Controller Check
            if (cronControllerChange) {
                console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stopping and Re-starting MOVISTAR cronController at " + dateFormat(new Date()));
                cronControllerChange = false;                
                clearInterval(cronController); 
                cronController = null;                
                await startController(intervalControl).catch(error => { throw new Error("ERROR in MOVISTAR cronController." + error.message) });
            }            
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "MOVISTAR cronController : cronMain intervalControl is " + interval + ", cronController interval is " + interval + ", operator is '" + operator + "' and status is " + cronStatus + " ([1:ON, 0:OFF]).");
            if (!cronStatus) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ATTENTION: MOVISTAR cronMain is OFF");
        });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we have had a problem with MOVISTAR configuration in Redis. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkstatus = async (newCronStatus) => { //Check status, if it's necessary finish cron because redis say it.
    try {
        if (cronStatus != newCronStatus) {
            cronStatus = newCronStatus;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find MOVISTAR status in Redis (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async (newInterval) => { //check rate/s, and change cron rate
    try {
        if (interval != newInterval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change MOVISTAR cronMain interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = newInterval;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find MOVISTAR interval in Redis. current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkIntervalControl = async (newIntervalControl) => { //check rate/s, and change cron rate
    try {
        if (intervalControl != newIntervalControl) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change MOVISTAR cronController interval:  " + intervalControl + " for new interval : " + newIntervalControl + " , next restart will be effect.");
            intervalControl = newIntervalControl;
            cronControllerChange = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING  checkIntervalControl: we didn't find MOVISTAR intervalControl in Redis. current intervalControl " + intervalControl + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkOperator = async (newOperator) => { //change operator for HA //"MOV", "VIP", "VOD", "ORA",... //change operator for HA
    try {
        if (newOperator.toString().trim() != operator) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change MOVISTAR operator " + operator + " for " + newOperator);
            operator = newOperator;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find MOVISTAR operator in Redis , actual operator : " + operator + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const initCron = async () => {
    try {
        cronConf = await hgetall(defaultCollector); // redis conf
        if (cronConf) {
            interval = parseInt(cronConf.interval); //The rate/cronMain interval
            intervalControl = parseInt(cronConf.intervalControl); //the interval of controller
            cronStatus = parseInt(cronConf.status); //maybe somebody stops collector
            checkOperator(cronConf.operator);
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find MOVISTAR initialization parameters in Redis, we will initialize cron with default params  . . Process continuing. ");

        if (cronStatus) {
            await startCron(interval).catch(error => { throw new Error("ERROR in MOVISTAR cronMain." + error.message) });
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing MOVISTAR cronMain at " + dateFormat(new Date()) + " with interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms], and collector operator  [" + operator + "].");
        } else {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "MOVISTAR Redis Configuration status indicates we don't want start cronMain process. we only start cron Controller.");
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "MOVISTAR cronController : cronMain interval is " + interval + ", cronController intervalControl is " + interval + ", operator is '" + operator + "' and status is " + cronStatus + " ([1:ON, 0:OFF]).");
        }

        await startController(intervalControl).catch(error => { throw new Error("ERROR in MOVISTAR cronController." + error.message) });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We have a problem in initialization. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        cronStatus = 1;
        startCron(interval); // 100 message/s
        startController(intervalControl); // 60 seconds        
    }
}

module.exports = { initCron }