

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
const { sendPNS } = require('./pnsSendGOO');


//Variables
const PNS_IDS = "PNS.IDS.PENDING";
const defaultOperator = "GOO"; //default operator for this collector: "GOO"
const defaultCollector = "collectorpns:" + defaultOperator; // default collector, for configurations
const channels = buildPNSChannels(defaultOperator); //Channels to receive PNS request always are the same.

var operator = defaultOperator; //default operator for this collector: "GOO"
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
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing GOOGLE cronMain with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "GOOGLE cronMain is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "GOOGLE cron executing ");
                sendNextPNS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start GOOGLE cron." + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping GOOGLE cronMain ");
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop GOOGLE cronMain. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const sendNextPNS = async () => {
    try {
        const pnsJSON = await nextPNS(); //get message with rpop command from PNS.GOO.1, 2, 3 
        if (pnsJSON) {
            let date = new Date();
            const pns = new Pns(JSON.parse(pnsJSON));  // convert json text to json object            
            // if ((pns.expire) && (date > pns.expire)) { // is the PNS expired?   //EXPIRED              
            //     updateOnePNS(pns._id, { expired: true, status: 4 }).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message) }); //update PNS in MongoDB, is the last task, it's unnecessary await //0:notSent, 1:Sent, 2:Confirmed, 3:retry, 4:Expired, 5:Error
            //     sismember(PNS_IDS, pns._id).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS ERROR : " + pns._id + " : " + error.message); }); //delete from redis ID control, in error case we continue
            //     console.log(process.env.YELLOW_COLOR, logTime(date) + " The PNS " + pns._id + " has expired and has not been sent.");
            // } else {  //GOOGLE WILL SEND
            //pns.validate(); //It's unnecessary because we cautched from redis, and we checked before in the apipns, the new params are OK.               
            let toUpdate = { status: 1, dispatched: true, dispatchedAt: date, retries: ++pns.retries };
            Promise.all([ //Always we need delete ID in PNS_IDS SET, in error case we continue
                sendPNS(pns).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS ERROR : " + pns._id + " : " + error.message); return 3; }), // send PNS to operator, //return status: 0:notSent, 1:Sent, 2:Confirmed, 3:retry, 4:Expired, 5:Error 
                updateOnePNS(pns._id, toUpdate).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS ERROR : " + pns._id + " : " + error.message); return null; }) // update PNS in MongoDB, in error case we continue       
            ]).then((values) => { //we always enter here                        
                if (values[0] != 1) { //if status is different than 1: sent, save new state
                    updateOnePNS(pns._id, { status: values[0], dispatched: false, dispatchedAt: null }).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS ERROR : " + pns._id + " : " + error.message); }); //status is different than 1 (sent), so we need to save new state //change status for error
                    hincrby1(defaultCollector, "errors");
                } else {
                    hincrby1(defaultCollector, "processed");
                    console.log(process.env.GREEN_COLOR, logTime(date) + "PNS sended : " + pns._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string                       
                }
                sismember(PNS_IDS, pns._id).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS ERROR : " + pns._id + " : " + error.message); }); //delete from redis ID control, in error case we continue
            });
        }
        //}
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in GOOGLE cronMain sendNextPNS() : " + error.message);
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
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing GOOGLE cronController with intervalControl : " + intervalControl);
        hset(defaultCollector, "last", dateFormat(new Date())); //save first execution in Redis
        if (cronController) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "GOOGLE cronController is executing, so we don't need re-start it.");
        } else {
            cronController = setInterval(function () {
                checksController();
            }, intervalControl);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start GOOGLE cron Controller. . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const checksController = async () => {
    try {
        hset(defaultCollector, "last", dateFormat(new Date())).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); });  //save last execution in Redis, in error case we continue
        cronConf = await hgetall(defaultCollector); //get the cronConf
        if (cronConf && Object.keys(cronConf).length > 1) {
            Promise.all([ //In error case we continue with other tasks
                checkstatus(cronConf.status).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check status in Redis, in error case we continue
                checkInterval(cronConf.interval).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check interval in Redis, in error case we continue
                checkIntervalControl(cronConf.intervalControl).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //check intervalControl in Redis, in error case we continue
            ]).then(async () => {
                // Cron Main Check
                if (cronChanged) { //some param changed in cron, we need to restart or stopped.
                    if (cronStatus) { //cron must to be started                       
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Stopping and Re-Starting GOOGLE cronMain...");
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
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stopping and Re-starting GOOGLE cronController ");
                    cronControllerChanged = false;
                    clearInterval(cronController);
                    cronController = null;
                    await startController(intervalControl).catch(error => { throw new Error("ERROR in GOOGLE cronController." + error.message) });
                }
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "GOOGLE cronMain interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms], collector operator  [" + operator + "] and status [" + cronStatus + "](1:ON, 0:OFF).");
                if (!cronStatus) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ATTENTION: GOOGLE cronMain is OFF");
            });
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find configuration parameters in Redis, we will continue with default params. Process continuing.");
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we have had a problem with GOOGLE configuration in Redis. Process continuing... " + error.message);
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
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find GOOGLE status in Redis (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const checkInterval = async (newInterval) => { //check rate/s, and change cron rate
    try {
        if (newInterval && parseInt(newInterval) != interval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change GOOGLE cronMain interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = parseInt(newInterval);
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find GOOGLE interval in Redis. current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkIntervalControl = async (newIntervalControl) => { //check rate/s, and change cron rate
    try {
        if (newIntervalControl && parseInt(newIntervalControl) != intervalControl) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change GOOGLE cronController interval:  " + intervalControl + " for new interval : " + newIntervalControl + " , next restart will be effect.");
            intervalControl = parseInt(newIntervalControl);
            cronControllerChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING  checkIntervalControl: we didn't find GOOGLE intervalControl in Redis. current intervalControl " + intervalControl + " . . Process continuing... " + error.message);
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
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find GOOGLE initialization parameters in Redis, we will initialize cron with default params  . . Process continuing. ");

        if (cronStatus) {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "GOOGLE cronMain interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms], collector operator  [" + operator + "] and status [" + cronStatus + "](1:ON, 0:OFF).");
            await startCron(interval).catch(error => { throw new Error("ERROR in GOOGLE cronMain." + error.message) });
        } else {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "GOOGLE Redis Configuration status indicates we don't want start cronMain process. we only start cron Controller.");
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "GOOGLE cronController : cronMain interval is " + interval + ", operator is '" + operator + "' and status is " + cronStatus + " [1:ON, 0:OFF].");
        }

        await startController(intervalControl).catch(error => { throw new Error("ERROR in GOOGLE cronController." + error.message) });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We have a problem in initialization. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        cronStatus = 1;
        startCron(interval); // 100 message/s
        startController(intervalControl); // 60 seconds        
    }
}

module.exports = { initCron }