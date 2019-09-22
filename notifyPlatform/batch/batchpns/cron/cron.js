

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const { Pns } = require('../models/pns');
const { rclient } = require('../config/redispns'); //we need to initialize redis
const { hgetConf, hset } = require('../util/redisconf');
const { dateFormat, logTime, buildPNSChannel } = require('../util/formats'); // utils for formats
const { savePNS } = require('../util/mongopns');
const auth = require('../auth/auth');
const fs = require('fs');

//Variables
const batchIn = './files/in/';
const batchOut = './files/out/';
const batchName = "collectorpns:batchPNS";
const PNS_IDS = "PNS.IDS.PENDING";
var cron; //the main cron that manage files and put them into redis List.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron, 
var interval = 180000; //define the interval, in this case 3 minutes.
var intervalControl = 60000; //define interval in controller cron (check by min. by default)
var nextExecution = true;


const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing batchPNS at " + dateFormat(new Date()) + " with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "batchPNS is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "batchPNS executing ");
                getPNSFiles();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start batchPNS . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping batchPNS cron at " + dateFormat(new Date()));
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop batchPNS. Process continuing... " + error.message);
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
                    notifications.forEach(async (pnsJSON) => {
                        try {
                            var pns = new Pns(pnsJSON); // convert json to object,  await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
                            pns.priority = priority;
                            pns.token = await hget("tokenpns" + pns.application + ":" + pns.uuiddevice, "token"); //find the token for this uuiddevice PNS.
                            pns.operator = await hget("tokenpns" + pns.application + ":" + pns.uuiddevice, "operator"); //find the operator for this uuiddevice PNS.
                            if (!pns.token) throw new Error(" This uuiddevice is not register, we cannot find its token neither operator.") //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired, 5:token not found (not register)

                            const collectorOperator = hgetConf("collectorpns:" + pns.operator, "operator"); //this method is Async, but we can get in parallel until need it (with await).
                            if (await collectorOperator != pns.operator) pns.operator = collectorOperator;  //check if the operator have some problems

                            pns.channel = buildPNSChannel(pns.operator, priority); //get the channel to put notification with operator and priority

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
                                });

                        } catch (error) {
                            let contract = pns.contract || 'undefined';
                            let uuiddevice = pns.uuiddevice || 'undefined';
                            let content = pns.content || 'undefined';
                            let application = pns.application || 'undefined';
                            let action = pns.action || 'undefined';

                            const errorJson = { StatusCode: "MQ Error", error: error.message, contractpns: contract, uuiddevice: uuiddevice, application: application, action: action, content: content, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
                            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: " + JSON.stringify(errorJson));
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
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in batchPNS.getPNSFiles() : " + error.message);
            //console.error(error); //continue the execution cron
        }
        nextExecution = true;
    }
}

const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing cronController at " + dateFormat(new Date()) + " with intervalControl : " + intervalControl);
        hset(batchName, "last", dateFormat(new Date())); //save first execution in Redis
        var cronController = setInterval(function () {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "cronController executing: Main cron interval is " + interval + " and status is " + cronStatus + " [1:ON, 0:OFF].");
            hset(batchName, "last", dateFormat(new Date())); //save last execution in Redis
            checksController();
        }, intervalControl);
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start cron Controller. . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const checksController = async () => {
    await Promise.all([
        checkstatus(),
        checkInterval(),
    ]);

    if (cronChanged) { //some param changed in cron, we need to restart or stopped.
        if (cronStatus) { //cron must to be started                       
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Re-Start batchPNS cron...");
            cronChanged = false;
            await stopCron();
            await startCron(interval);
        } else { //cron must to be stopped            
            cronChanged = false;
            await stopCron(); //if I stop cron N times, it doesn't matter... 
        }
    }


}
const checkstatus = async () => { //Check status, if it's necessary finish cron because redis say it.
    try {
        let newCronStatus = parseInt(await hgetConf(batchName, "status"));  //0 stop, 1 OK.  //finish because redis say it 
        if (cronStatus != newCronStatus) {
            cronStatus = newCronStatus;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: we didn't find status (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async () => { //check rate/s, and change cron rate
    try {
        let newInterval = parseInt(await hgetConf(batchName, "interval"));  //rate/s //change cron rate    
        if (interval != newInterval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = newInterval;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: we didn't find rate in Redis (cron interval). current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const initCron = async () => {
    try {
        await Promise.all([
            hgetConf(batchName, "interval"),
            hgetConf(batchName, "intervalControl"),
            hgetConf(batchName, "status"),
        ]).then((values) => {
            interval = parseInt(values[0]); //The rate/Main cron interval
            intervalControl = parseInt(values[1]); //the interval of controller
            cronStatus = parseInt(values[2]); //maybe somebody stops collector
        });

        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing all crons processes at " + dateFormat(new Date()) + " with cron interval [" + interval + "ms] and cron Controller interval : [" + intervalControl + "ms]...");
        if (cronStatus) {
            getPNSFiles(); // first execution 
            await startCron(interval);
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Cron status in redis indicates we don't want start cron process. we only start cron Controller.");
        await startController(intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: we didn't find initialize params, we will initialize cron with default params (every 10s, and 60s to reconfig) . . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
        await startCron(10000); // 10 seconds
        await startController(60000); // 60 seconds
        cronStatus = 1;
    }
}

module.exports = { initCron }