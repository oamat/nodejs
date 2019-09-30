

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const { Pns } = require('../models/pns');
const { rpop, sismember } = require('../util/redispns'); //we need to initialize redis
const { hset, hgetall, hincrby1 } = require('../util/redisconf');
const { dateFormat, logTime, buildPNSChannels } = require('../util/formats'); // utils for formats
const { updatePNS } = require('../util/mongopns'); //for updating status
const { sendPNS } = require('./pnsSendMIC');


//Variables
const PNS_IDS = "PNS.IDS.PENDING";
const defaultOperator = "MIC"; //default operator for this collector: "MIC"
const defaultCollector = "collectorpns:" + defaultOperator; // default collector, for configurations
const channels = buildPNSChannels(defaultOperator); //Channels to receive PNS request always are the same.

var operator = defaultOperator; //default operator for this collector: "MIC"
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
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing MICROSOFT cronMain with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "MICROSOFT cronMain is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "MICROSOFT cron executing ");
                sendNextPNS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start MICROSOFT cron." + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping MICROSOFT cronMain ");
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop MICROSOFT cronMain. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const sendNextPNS = async () => {
    try {
        const pnsJSON = await nextPNS(); //get message with rpop command from PNS.MIC.1, 2, 3 
        if (pnsJSON) {
            const pns = new Pns(JSON.parse(pnsJSON)); //EXPIRED // convert json text to json object   
            if ((pns.expire) && (Date.now() > pns.expire)) { // is the PNS expired?
                pns.expired = true;
                pns.status = 4; //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired
                updatePNS(pns).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message) }); //update PNS in MongoDB, is the last task, it's unnecessary await
                console.log(process.env.YELLOW_COLOR, logTime(new Date()) + " The PNS " + pns._id + " has expired and has not been sent.");
            } else {  //MICROSOFT WILL SEND
                //pns.validate(); //It's unnecessary because we cautched from redis, and we checked before in the apipns, the new params are OK.     
                pns.status = 1;
                pns.retries++;
                pns.dispatched = true;
                pns.dispatchedAt = new Date();
                Promise.all([ //Always we need delete ID in PNS_IDS SET, in error case we continue
                    updatePNS(pns).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), // update PNS in MongoDB, in error case we continue
                    sismember(PNS_IDS, pns._id).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //delete from redis ID control, in error case we continue
                    sendPNS(pns).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); return 3; }) // send PNS to operator, //return status: 0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired 
                ]).then((values) => { //we always enter here
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS sended : " + pns._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
                    if (values[2] == 3) { //if stataus is different than 1: sent
                        values[0].status = 3; //error
                        updatePNS(values[0]).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); });
                        hincrby1(defaultCollector, "errors");
                    }
                    hincrby1(defaultCollector, "processed");
                });
            }
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in MICROSOFT cronMain sendNextPNS() : " + error.message);
        hincrby1(defaultCollector, "errors");
        //console.error(error); //continue the execution cron
    }
}

const nextPNS = async () => {
    try {
        return await rpop(channels.channel0) || await rpop(channels.channel1) || await rpop(channels.channel2) || await rpop(channels.channel3) || await rpop(channels.channel4) || await rpop(channels.channel5); //return the next pns by priority order.  
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem with redis rpop : " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing MICROSOFT cronController with intervalControl : " + intervalControl);
        hset(defaultCollector, "last", dateFormat(new Date())); //save first execution in Redis
        if (cronController) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "MICROSOFT cronController is executing, so we don't need re-start it.");
        } else {
            cronController = setInterval(function () {
                checksController();
            }, intervalControl);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start MICROSOFT cron Controller. . Process continuing... " + error.message);
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
                checkIntervalControl(cronConf.intervalControl).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //check intervalControl in Redis, in error case we continue
            ]).then(async () => {
                // Cron Main Check
                if (cronChanged) { //some param changed in cron, we need to restart or stopped.
                    if (cronStatus) { //cron must to be started                       
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Stopping and Re-Starting MICROSOFT cronMain...");
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
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stopping and Re-starting MICROSOFT cronController ");
                    cronControllerChanged = false;
                    clearInterval(cronController);
                    cronController = null;
                    await startController(intervalControl).catch(error => { throw new Error("ERROR in MICROSOFT cronController." + error.message) });
                }
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "MICROSOFT cronController : cronMain intervalControl is " + interval + ", cronController interval is " + interval + ", operator is '" + operator + "' and status is " + cronStatus + " ([1:ON, 0:OFF]).");
                if (!cronStatus) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ATTENTION: MICROSOFT cronMain is OFF");
            });
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find configuration parameters in Redis, we will continue with default params. Process continuing.");
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we have had a problem with MICROSOFT configuration in Redis. Process continuing... " + error.message);
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
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find MICROSOFT status in Redis (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async (newInterval) => { //check rate/s, and change cron rate
    try {
        if (newInterval && parseInt(newInterval) != interval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change MICROSOFT cronMain interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = parseInt(newInterval);
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find MICROSOFT interval in Redis. current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkIntervalControl = async (newIntervalControl) => { //check rate/s, and change cron rate
    try {
        if (newIntervalControl && parseInt(newIntervalControl) != intervalControl) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change MICROSOFT cronController interval:  " + intervalControl + " for new interval : " + newIntervalControl + " , next restart will be effect.");
            intervalControl = parseInt(newIntervalControl);
            cronControllerChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING  checkIntervalControl: we didn't find MICROSOFT intervalControl in Redis. current intervalControl " + intervalControl + " . . Process continuing... " + error.message);
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
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find MICROSOFT initialization parameters in Redis, we will initialize cron with default params  . . Process continuing. ");

        if (cronStatus) {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "MICROSOFT cronMain interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms], collector operator  [" + operator + "] and status [" + cronStatus + "](1:ON, 0:OFF).");
            await startCron(interval).catch(error => { throw new Error("ERROR in MICROSOFT cronMain." + error.message) });
        } else {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "MICROSOFT Redis Configuration status indicates we don't want start cronMain process. we only start cron Controller.");
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "MICROSOFT cronController : cronMain interval is " + interval + ", operator is '" + operator + "' and status is " + cronStatus + " [1:ON, 0:OFF].");
        }

        await startController(intervalControl).catch(error => { throw new Error("ERROR in MICROSOFT cronController." + error.message) });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We have a problem in initialization. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        cronStatus = 1;
        startCron(interval); // 100 message/s
        startController(intervalControl); // 60 seconds        
    }
}

module.exports = { initCron }