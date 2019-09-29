

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const { Sms } = require('../models/sms');
const { rpop, lpush, sismember } = require('../util/redissms'); //we need to initialize redis
const { hset, hgetall, hincrby1 } = require('../util/redisconf');
const { dateFormat, logTime, buildSMSChannel, buildSMSChannels } = require('../util/formats'); // utils for formats
const { updateSMS } = require('../util/mongosms'); //for updating status
const { sendSMS } = require('./smsSendVOD');


//Variables
const SMS_IDS = "SMS.IDS.PENDING";
const defaultOperator = "VOD"; //default operator for this collector: "VOD"
const defaultCollector = "collectorsms:" + defaultOperator; // default collector, for configurations
const channels = buildSMSChannels(defaultOperator); //Channels to receive SMS request always are the same.

var operator = defaultOperator; //default operator for this collector: "VOD"
var cronConf; //the redis cron configuration 
var cron; //the main cron that send message to the operator.
var cronController;  //the Controller cron that send message to the operator.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron,  we use this control var
var cronControllerChanged = false; //if we need restart cron, we use this control var
var interval = 10; //define the rate/s notifications, interval in cron (100/s by default)
var intervalControl = 60000; //define interval in controller cron (check by min. by default)


const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing VODAFONE cronMain with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "VODAFONE cronMain is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "VODAFONE cron executing ");
                sendNextSMS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start VODAFONE cron." + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping VODAFONE cronMain ");
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop VODAFONE cronMain. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const sendNextSMS = async () => {
    try {
        const smsJSON = await nextSMS(); //get message with rpop command from SMS.VOD.1, 2, 3 
        if (smsJSON) {
            const sms = new Sms(JSON.parse(smsJSON)); //EXPIRED // convert json text to json object   
            if ((sms.expire) && (Date.now() > sms.expire)) { // is the SMS expired?
                sms.expired = true;
                sms.status = 4; //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired
                updateSMS(sms).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message) }); //update SMS in MongoDB, is the last task, it's unnecessary await
                console.log(process.env.YELLOW_COLOR, logTime(new Date()) + " The SMS " + sms._id + " has expired and has not been sent.");
            } else {
                //sms.validate(); //It's unnecessary because we cautched from redis, and we checked before in the apisms, the new params are OK.
                if (operator == defaultOperator) { //VODAFONE WILL SEND //If we change operator for contingency we change sms to other list
                    sms.status = await sendSMS(sms); // send SMS to operator, //return status: 0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired   
                    sms.retries++;
                    sms.dispatched = true;
                    sms.dispatchedAt = new Date();
                    Promise.all([ //Always we need delete ID in SMS_IDS SET, in error case we continue
                        updateSMS(sms).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), // update SMS in MongoDB, in error case we continue
                        sismember(SMS_IDS, sms._id).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //delete from redis ID control, in error case we continue
                    ]).then(() => { //we always enter here
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS sended : " + sms._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                        hincrby1(defaultCollector, "processed");
                    });
                } else { //CONTINGENCY //In this case we don't delete ID in SMS_IDS SET.
                    sms.operator = operator; //The real operator to we will send SMS message      
                    sms.channel = buildSMSChannel(operator, sms.priority); //The real channel we will send SMS message
                    await lpush(sms.channel, JSON.stringify(sms)); // we put message to the other operator List
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "change SMS " + sms._id + " from " + defaultOperator + " to " + operator); // we inform about this exceptional action
                    hincrby1(defaultCollector, "processed");
                }
            }
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in VODAFONE cronMain sendNextSMS() : " + error.message);
        hincrby1(defaultCollector, "errors");
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
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing VODAFONE cronController with intervalControl : " + intervalControl);
        hset(defaultCollector, "last", dateFormat(new Date())); //save first execution in Redis
        if (cronController) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "VODAFONE cronController is executing, so we don't need re-start it.");
        } else {
            cronController = setInterval(function () {
                checksController();
            }, intervalControl);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start VODAFONE cron Controller. . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const checksController = async () => {
    try {
        cronConf = await hgetall(defaultCollector); //get the cronConf
        if (cronConf && Object.keys(cronConf).length > 1) {
            Promise.all([ //In error case we continue with other tasks
                hset(defaultCollector, "last", dateFormat(new Date())).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }),  //save last execution in Redis, in error case we continue
                checkstatus(cronConf.status).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check status in Redis, in error case we continue
                checkInterval(cronConf.interval).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check interval in Redis, in error case we continue
                checkOperator(cronConf.operator).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check operator in Redis, in error case we continue
                checkIntervalControl(cronConf.intervalControl).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //check intervalControl in Redis, in error case we continue
            ]).then(async () => {
                // Cron Main Check
                if (cronChanged) { //some param changed in cron, we need to restart or stopped.
                    if (cronStatus) { //cron must to be started                       
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Stopping and Re-Starting VODAFONE cronMain...");
                        cronChanged = false;
                        await stopCron();
                        await startCron(interval);
                    } else { //cron must to be stopped            
                        cronChanged = false;
                        await stopCron(); //if I stop cron N times, it doesn't matter... 
                    }
                }
                // Cron Controller Check
                if (cronControllerChanged) {
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stopping and Re-starting VODAFONE cronController ");
                    cronControllerChanged = false;
                    clearInterval(cronController);
                    cronController = null;
                    await startController(intervalControl).catch(error => { throw new Error("ERROR in VODAFONE cronController." + error.message) });
                }
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "VODAFONE cronMain interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms], collector operator  [" + operator + "] and status [" + cronStatus + "](1:ON, 0:OFF).");
                if (!cronStatus) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ATTENTION: VODAFONE cronMain is OFF");
            });
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find configuration parameters in Redis, we will continue with default params. Process continuing.");
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we have had a problem with VODAFONE configuration in Redis. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkstatus = async (newCronStatus) => { //Check status, if it's necessary finish cron because redis say it.
    try {
        if (newCronStatus && parseInt(newCronStatus) != cronStatus) {
            cronStatus = parseInt(newCronStatus);
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find VODAFONE status in Redis (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async (newInterval) => { //check rate/s, and change cron rate
    try {
        if (newInterval && parseInt(newInterval) != interval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change VODAFONE cronMain interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = parseInt(newInterval);
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find VODAFONE interval in Redis. current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkIntervalControl = async (newIntervalControl) => { //check rate/s, and change cron rate
    try {
        if (newIntervalControl && parseInt(newIntervalControl) != intervalControl) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change VODAFONE cronController interval:  " + intervalControl + " for new interval : " + newIntervalControl + " , next restart will be effect.");
            intervalControl = parseInt(newIntervalControl);
            cronControllerChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING  checkIntervalControl: we didn't find VODAFONE intervalControl in Redis. current intervalControl " + intervalControl + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkOperator = async (newOperator) => { //change operator for HA //"MOV", "VIP", "VOD", "ORA",... //change operator for HA
    try {
        if (newOperator && newOperator.toString() != operator) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change VODAFONE operator " + operator + " for " + newOperator);
            operator = newOperator;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find VODAFONE operator in Redis , actual operator : " + operator + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const initCron = async () => {
    try {
        cronConf = await hgetall(defaultCollector); // redis conf
        if (cronConf && Object.keys(cronConf).length > 1) {
            if (cronConf.interval) interval = parseInt(cronConf.interval); //The rate/cronMain interval
            if (cronConf.intervalControl) intervalControl = parseInt(cronConf.intervalControl); //the interval of controller
            if (cronConf.status) cronStatus = parseInt(cronConf.status); //maybe somebody stops collector
            if (cronConf.operator) checkOperator(cronConf.operator);
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find VODAFONE initialization parameters in Redis, we will initialize cron with default params  . . Process continuing. ");


        if (cronStatus) {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "VODAFONE cronMain interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms], collector operator  [" + operator + "] and status [" + cronStatus + "](1:ON, 0:OFF).");
            await startCron(interval).catch(error => { throw new Error("ERROR in VODAFONE cronMain." + error.message) });
        } else {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "VODAFONE Redis Configuration status indicates we don't want start cronMain process. we only start cron Controller.");
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "VODAFONE cronController : cronMain interval is " + interval + ", operator is '" + operator + "' and status is " + cronStatus + " [1:ON, 0:OFF].");
        }

        await startController(intervalControl).catch(error => { throw new Error("ERROR in VODAFONE cronController." + error.message) });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We have a problem in initialization. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        cronStatus = 1;
        startCron(interval); // 100 message/s
        startController(intervalControl); // 60 seconds        
    }
}

module.exports = { initCron }