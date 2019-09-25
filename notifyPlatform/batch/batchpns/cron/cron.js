

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const { Pns } = require('../models/pns');
const { rclient } = require('../config/redispns'); //we need to initialize redis
const { hset, hgetall, hincrby1 } = require('../util/redisconf');
const { dateFormat, logTime, buildPNSChannel } = require('../util/formats'); // utils for formats
const { savePNS } = require('../util/mongopns'); //for updating status
const auth = require('../auth/auth');
const fs = require('fs');

//Variables
const batchIn = './files/in/';
const batchOut = './files/out/';
const batchName = "collectorpns:batchPNS";
const PNS_IDS = "PNS.IDS.PENDING";
var cronConf; //the redis cron configuration 
var cron; //the main cron that send message to the operator.
var cronController;  //the Controller cron that send message to the operator.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron,  we use this control var
var cronControllerChanged = false; //if we need restart cron, we use this control var
var interval = 180000; //define the interval, in this case 3 minutes.
var intervalControl = 60000; //define interval in controller cron (check every min. by default)
var nextExecution = true;


const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing BATCHPNS cronMain with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "BATCHPNS cronMain is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "BATCHPNS cron executing ");
                getPNSFiles();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start BATCHPNS cron." + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping BATCHPNS cronMain ");
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop BATCHPNS cronMain. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const getPNSFiles = async () => {
    if (nextExecution) {
        nextExecution = false;
        try {
            fs.readdirSync(batchIn).forEach(async (filename) => {
                if (require('path').extname(filename) == ".json") {
                    console.log(logTime(new Date()) + "Process of file :" + filename);
                    var file = fs.readFileSync(batchIn + filename);
                    var fileJSON = JSON.parse(file);
                    await auth(fileJSON.fileBatch.contract, fileJSON.fileBatch.jwt);
                    var priority = fileJSON.fileBatch.priority;
                    if (priority < 4) priority = 4; //only accept priorities 4 or 5 in batch. (0,1 are reserved for REST interface, 2,3 for MQ interface).
                    var notifications = fileJSON.fileBatch.notifications;
                    console.log(logTime(new Date()) + filename + " have " + notifications.length + " notifications to send");
                    notifications.forEach(async (pnsJSON, index) => {
                        try {
                            var pns = new Pns(pnsJSON); // convert json to object,  await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
                            pns.priority = priority;
                            let tokenConf = await hgetall("tokenpns" + pns.application + ":" + pns.uuiddevice); ////find the "token" & "operator" for this application uuiddevice PNS.
                            if (!tokenConf || !tokenConf.token || !tokenConf.operator) throw new Error("This uuiddevice is not register, we cannot find its token neither operator : 'tokenpns" + pns.application + ":" + pns.uuiddevice) //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired, 5:token not found (not register)
                            pns.token = tokenConf.token; //get the token for this uuiddevice PNS.
                            pns.operator = tokenConf.operator; //get the operator for this uuiddevice PNS.
                            pns.channel = buildPNSChannel(pns.operator, pns.priority); //get the channel to put notification with operator and priority

                            //await pns.validate(); //validate is unnecessary, we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.

                            savePNS(pns) //save pns to DB, in this phase we need save PNS to MongoDB. //If you didn't execute "pns.validate()" we would need await in save.
                                .catch(error => {     // we need catch only if get 'await' out          
                                    throw error;
                                })
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
                                    hincrby1(batchName, "processed");
                                    if ( (index + 1) == notifications.length ) console.log(logTime(new Date()) + + notifications.length + ' notifications processed.');
                                });
                        } catch (error) {
                            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: BatchPNS processing a notification:  batchPNS.getPNSFiles() : process continue, error :" + error.message);
                            hincrby1(batchName, "errors");
                            ////console.error(error); //continue the execution cron          
                            //TODO: save error in db  or mem.
                        }
                    });

                    fs.rename(batchIn + filename, batchOut + filename, (err) => {
                        if (err) throw err;
                        console.log(logTime(new Date()) + batchIn + filename + ' move to ' + batchOut + filename + ' complete!');
                    });
                } else {
                    console.log(logTime(new Date()) + "No files found.");
                }
            });
        } catch (error) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: BatchPNS processing a file: batchPNS.getPNSFiles() : " + error.message);
            //console.error(error); //continue the execution cron
        }
        nextExecution = true;
    }
}


const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing BATCHPNS cronController with intervalControl : " + intervalControl);
        hset(batchName, "last", dateFormat(new Date())); //save first execution in Redis
        if (cronController) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "BATCHPNS cronController is executing, so we don't need re-start it.");
        } else {
            cronController = setInterval(function () {
                checksController();
            }, intervalControl);
        }
        getPNSFiles(); // first execution    
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start BATCHPNS cron Controller. . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const checksController = async () => {
    try {
        cronConf = await hgetall(batchName); //get the cronConf
        Promise.all([ //In error case we continue with other tasks
            hset(batchName, "last", dateFormat(new Date())).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }),  //save last execution in Redis, in error case we continue
            checkstatus(parseInt(cronConf.status)).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check status in Redis, in error case we continue
            checkInterval(parseInt(cronConf.interval)).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check interval in Redis, in error case we continue
            checkIntervalControl(parseInt(cronConf.intervalControl)).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //check intervalControl in Redis, in error case we continue
        ]).then(async () => {
            // Cron Main Check
            if (cronChanged) { //some param changed in cron, we need to restart or stopped.
                if (cronStatus) { //cron must to be started                       
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Stopping and Re-Starting BATCHPNS cronMain...");
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
                console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stopping and Re-starting BATCHPNS cronController ");
                cronControllerChanged = false;
                clearInterval(cronController);
                cronController = null;
                await startController(intervalControl).catch(error => { throw new Error("ERROR in BATCHPNS cronController." + error.message) });
            }
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "BATCHPNS cronController : cronMain intervalControl is " + interval + ", cronController interval is " + interval + " and status is " + cronStatus + " ([1:ON, 0:OFF]).");
            if (!cronStatus) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ATTENTION: BATCHPNS cronMain is OFF");
        });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we have had a problem with BATCHPNS configuration in Redis. Process continuing... " + error.message);
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
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find BATCHPNS status in Redis (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async (newInterval) => { //check rate/s, and change cron rate
    try {
        if (interval != newInterval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change BATCHPNS cronMain interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = newInterval;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find BATCHPNS interval in Redis. current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkIntervalControl = async (newIntervalControl) => { //check rate/s, and change cron rate
    try {
        if (intervalControl != newIntervalControl) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change BATCHPNS cronController interval:  " + intervalControl + " for new interval : " + newIntervalControl + " , next restart will be effect.");
            intervalControl = newIntervalControl;
            cronControllerChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING  checkIntervalControl: we didn't find BATCHPNS intervalControl in Redis. current intervalControl " + intervalControl + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const initCron = async () => {
    try {
        cronConf = await hgetall(batchName); // redis conf
        if (cronConf) {
            interval = parseInt(cronConf.interval); //The rate/cronMain interval
            intervalControl = parseInt(cronConf.intervalControl); //the interval of controller
            cronStatus = parseInt(cronConf.status); //maybe somebody stops collector
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find BATCHPNS initialization parameters in Redis, we will initialize cron with default params  . . Process continuing. ");

        if (cronStatus) {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "BATCHPNS cronMain interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms] and status [" + cronStatus + "](1:ON, 0:OFF).");
            await startCron(interval).catch(error => { throw new Error("ERROR in BATCHPNS cronMain." + error.message) });
        } else {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "BATCHPNS Redis Configuration status indicates we don't want start cronMain process. we only start cron Controller.");
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "BATCHPNS cronController : cronMain interval is " + interval + ", cronController intervalControl is " + interval + " and status is " + cronStatus + " ([1:ON, 0:OFF]).");
        }

        await startController(intervalControl).catch(error => { throw new Error("ERROR in BATCHPNS cronController." + error.message) });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We have a problem in initialization. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        cronStatus = 1;
        startCron(interval); // 180000 ms by default /
        startController(intervalControl); // 60 seconds by default      
    }
}

module.exports = { initCron }