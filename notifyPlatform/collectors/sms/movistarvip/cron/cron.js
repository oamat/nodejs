

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
const { sendSMS } = require('./smsSendVIP');


//Variables
const SMS_IDS = "SMS.IDS.PENDING";
const defaultOperator = "VIP"; //default operator for this collector: "VIP"
const defaultCollector = "collectorsms:" + defaultOperator; // default collector, for configurations
const channels = buildSMSChannels(defaultOperator); //Channels to receive SMS request always are the same.

var operator = defaultOperator; //default operator for this collector: "VIP"
var cronConf; //the redis cron configuration 
var cron; //the main cron that send message to the operator.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron, 
var interval = 10; //define the rate/s notifications, interval in cron (100/s by default)
var intervalControl = 60000; //define interval in controller cron (check by min. by default)


const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing VIPISTAR-VIP cronMain at " + dateFormat(new Date()) + " with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "VIPISTAR-VIP cronMain is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "VIPISTAR-VIP cron executing ");
                sendNextSMS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start VIPISTAR-VIP cron." + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping VIPISTAR-VIP cronMain at " + dateFormat(new Date()));
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop VIPISTAR-VIP cronMain. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const sendNextSMS = async () => {
    try {
        const smsJSON = await nextSMS(); //get message with rpop command from SMS.VIP.1, 2, 3 
        if (smsJSON) {
            const sms = new Sms(JSON.parse(smsJSON)); // convert json to object   
            if ((sms.expire) && (Date.now() > sms.expire)) { // treat the expired SMS
                sms.expired = true;
                sms.status = 4; //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired
                updateSMS(sms); // update SMS in MongoDB
                console.log(process.env.YELLOW_COLOR, logTime(new Date()) + " The SMS " + sms._id + " has expired and has not been sent.");
            } else {
                //sms.validate(); //It's unnecessary because we cautched from redis, and we checked before in the apisms, the new params are OK.

                if (operator == defaultOperator) { //If we change operator for contingency we change sms to other list
                    sms.status = await sendSMS(sms); // send SMS to operator, //return status: 0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired   
                    sms.retries++;
                    sms.dispatched = true;
                    sms.dispatchedAt = new Date();
                    Promise.all([
                        updateSMS(sms).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), // update SMS in MongoDB, in error case we continue
                        sismember(SMS_IDS, sms._id).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //delete from redis ID control, in error case we continue
                    ]).then(() => {
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS sended : " + sms._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                    });
                } else {
                    sms.operator = operator; //The real operator to we will send SMS message                   
                    await lpush(buildSMSChannel(defaultOperator, sms.priority), JSON.stringify(sms)); // we put message to the other operator List
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "change SMS " + sms._id + " from " + defaultOperator + " to " + operator); // we inform about this exceptional action
                }
            }
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in VIPISTAR-VIP cronMain sendNextSMS() : " + error.message);
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
        var cronController = setInterval(function () {
            checksController();
        }, intervalControl);
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start cron Controller. . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const checksController = async () => {
    try {
        cronConf = await hgetall(defaultCollector);
        Promise.all([
            hset(defaultCollector, "last", dateFormat(new Date())).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }),  //save last execution in Redis, in error case we continue
            checkstatus(parseInt(cronConf.status)).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check status in Redis, in error case we continue
            checkInterval(parseInt(cronConf.interval)).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check interval in Redis, in error case we continue
            checkOperator(cronConf.operator).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //check operator in Redis, in error case we continue
        ]).then(async () => {
            if (cronChanged) { //some param changed in cron, we need to restart or stopped.
                if (cronStatus) { //cron must to be started                       
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Re-Start VIPISTAR-VIP cron...");
                    cronChanged = false;
                    await stopCron();
                    await startCron(interval);
                } else { //cron must to be stopped            
                    cronChanged = false;
                    await stopCron(); //if I stop cron N times, it doesn't matter... 
                }
            }
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "VIPISTAR-VIP cronController : cronMain interval is " + interval + ", operator is '" + operator + "' and status is " + cronStatus + " [1:ON, 0:OFF].");
        });


    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we have had a problem with VIPISTAR-VIP configuration in Redis. Process continuing... " + error.message);
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
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find VIPISTAR-VIP status in Redis (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async (newInterval) => { //check rate/s, and change cron rate
    try {
        if (interval != newInterval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change VIPISTAR-VIP cronMain interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = newInterval;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find VIPISTAR-VIP interval in Redis. current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkOperator = async (newOperator) => { //change operator for HA //"VIP", "VOD", "ORA",... //change operator for HA
    try {
        if (newOperator.toString().trim() != operator) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change VIPISTAR-VIP operator " + operator + " for " + newOperator);
            operator = newOperator;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find VIPISTAR-VIP operator in Redis , actual operator : " + operator + " . . Process continuing... " + error.message);
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
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find VIPISTAR-VIP initialization parameters in Redis, we will initialize cron with default params  . . Process continuing. ");


        if (cronStatus) {
            await startCron(interval).catch(error => { throw new Error("ERROR in VIPISTAR-VIP cronMain." + error.message) });
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing VIPISTAR-VIP cronMain at " + dateFormat(new Date()) + " with interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms], and collector operator  [" + operator + "].");
        } else {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "VIPISTAR-VIP Redis Configuration status indicates we don't want start cronMain process. we only start cron Controller.");
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "VIPISTAR-VIP cronController : cronMain interval is " + interval + ", operator is '" + operator + "' and status is " + cronStatus + " [1:ON, 0:OFF].");
        }

        await startController(intervalControl).catch(error => { throw new Error("ERROR in VIPISTAR-VIP cronController." + error.message) });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We have a problem in initialization. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        cronStatus = 1;
        startCron(interval); // 100 message/s
        startController(intervalControl); // 60 seconds        
    }
}

module.exports = { initCron }