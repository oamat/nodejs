

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const Pns = require('../models/pns');
const { hget, rpop, lpush, sadd } = require('../util/redispns'); //we need to initialize redis
const { dateFormat, buildPNSChannel } = require('../util/formats'); // utils for formats
const { savePNS } = require('../util/mongodb');
const auth = require('../auth/auth');
const fs = require('fs');
const batchIn = './files/in/';
const batchOut = './files/out/';

//Variables
var cron; //the main cron that manage files and put them into redis List.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron, 
var interval = 10; //define the rate/s notifications, interval in cron (100/s by default)
var intervalControl = 60000; //define interval in controller cron (check by min. by default)
var nextExecution = true;

const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, "initializing batchPNS at " + dateFormat(new Date()) + " with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, "batchPNS is executing, so we don't need re-start it.");
        } else {
            var counter = 0;
            cron = setInterval(function () {
                console.log(" batchPNS executing num:" + counter++);
                getSMSFiles();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot start batchPNS . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, "Stoping batchPNS cron at " + dateFormat(new Date()));
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot stop batchPNS. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const getSMSFiles = async () => {
    if (nextExecution) {
        nextExecution = false;
        try {
            fs.readdirSync(batchIn).forEach(async (filename) => {
                console.log(" Process of file :" + filename);
                var file = fs.readFileSync(batchIn + filename);
                var fileJSON = JSON.parse(file);
                await auth(fileJSON.fileBatch.contract, fileJSON.fileBatch.jwt);
                var priority = fileJSON.fileBatch.priority;
                if (priority < 4) priority = 4; //only accept priorities 4 or 5 in batch. (0,1 are reserved for REST interface, 2,3 for MQ interface).
                var notifications = fileJSON.fileBatch.notifications;
                console.log(filename + " have " + notifications.length + " notifications to send");
                notifications.forEach(async (pnsJSON) => {
                    try {
                        var pns = new Pns(pnsJSON); // convert json to object,  await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
                        pns.priority = priority;
                        pns.operator = await hget("contractpns:" + pns.contract, "operator"); //Operator by default by contract. we checked the param before (in auth)                         
                        if (pns.operator == "ALL") { //If operator is ALL means that we need to find the better operator for the telf. 
                            //TODO: find the best operator for this tef. Not implemented yet
                            pns.operator = "AND";
                        }
                        const collectorOperator = hget("collectorpns:" + pns.operator, "operator"); //this method is Async, but we can get in parallel until need it (with await).
                        if (await collectorOperator != pns.operator) pns.operator = collectorOperator;  //check if the operator have some problems

                        pns.channel = buildPNSChannel(pns.operator, priority); //get the channel to put notification with operator and priority

                        await pns.validate(); //we need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.
                        //If you didn't execute "pns.validate()" we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors.

                        await savePNS(pns) //save pns to DB, in this phase we need save SMS to MongoDB.
                            .catch(error => {
                                error.message = "ERROR :  We cannot save notify in MongoBD. " + error.message;
                                throw error;
                            });

                        // START 2 "tasks" in parallel. Even when we recollect the errors we continue the execution and return OK.    
                        Promise.all([
                            lpush(pns.channel, JSON.stringify(pns)).catch(error => { return error }),  //put pns to the the apropiate lists channels: SMS.AND.1, SMS.VIP.1, SMS.ORA.1, SMS.VOD.1 (1,2,3) 
                            sadd("SMS.IDS.PENDING", pns._id).catch(error => { return error }),         //we save the _id in a SET, for checking the retries, errors, etc.  
                        ]).then(values => {
                            if (values[0] instanceof Error) { console.log(process.env.YELLOW_COLOR, " ERROR: We cannot save SMS in Redis LIST (lpush): " + values[0].message); }  //lpush returns error
                            if (values[1] instanceof Error) { console.log(process.env.YELLOW_COLOR, " ERROR: We cannot save SMS in Redis SET (sadd): " + values[1].message); } //sadd returns error          
                        });
                        // END the 2 "tasks" in parallel    

                        console.log(process.env.GREEN_COLOR, " SMS to send : " + JSON.stringify(pns));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string

                    } catch (error) {
                        let contract = pns.contract || 'undefined';
                        let uuiddevice = pns.uuiddevice || 'undefined';
                        let content = pns.content || 'undefined';
                        let application = pns.application || 'undefined';
                        let action = pns.action || 'undefined';

                        const errorJson = { StatusCode: "MQ Error", error: error.message, contractpns: contract, uuiddevice: uuiddevice, application: application, action: action, content: content, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
                        console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
                        ////console.error(error); //continue the execution cron          
                        //TODO: save error in db  or mem.
                    }
                });

                fs.rename(batchIn + filename, batchOut + filename, (err) => {
                    if (err) throw err;
                    console.log(batchIn + filename + ' move to ' + batchOut + filename + ' complete!');
                });

            });
        } catch (error) {
            console.log(process.env.YELLOW_COLOR, "ERROR: we have a problem in batchPNS.getSMSFiles() : " + error.message);
            //console.error(error); //continue the execution cron
        }
        nextExecution = true;
    }
}


const nextSMS = async () => {
    try {
        return await rpop(channels.channel0) || await rpop(channels.channel1) || await rpop(channels.channel2) || await rpop(channels.channel3) || await rpop(channels.channel4) || await rpop(channels.channel5); //return the next pns by priority order.  
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we have a problem with redis rpop : " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, "initializing cronController at " + dateFormat(new Date()) + " with intervalControl : " + intervalControl);
        var cronController = setInterval(function () {
            console.log(process.env.GREEN_COLOR, "cronController executing");
            checksController();
        }, intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot start cron Controller. . Process continuing... " + error.message);
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
            console.log(process.env.GREEN_COLOR, "Re-Start batchPNS cron..." + cronStatus);
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
        let newCronStatus = parseInt(await hget("batch:PNS", "status"));  //0 stop, 1 OK.  //finish because redis say it 
        if (cronStatus != newCronStatus) {
            cronStatus = newCronStatus;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot change status (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async () => { //check rate/s, and change cron rate
    try {
        let newInterval = parseInt(await hget("batch:PNS", "interval"));  //rate/s //change cron rate    
        if (interval != newInterval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, "Change rate/interval: old rate " + interval + " , new rate : " + newInterval + " , next restart will be effect.");
            interval = newInterval;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot change rate (cron interval). current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const initCron = async () => {
    try {
        await Promise.all([
            hget("batch:PNS", "interval"),
            hget("batch:PNS", "intervalControl"),
            hget("batch:PNS", "status"),
        ]).then((values) => {
            interval = parseInt(values[0]); //The rate/interval of main cron
            intervalControl = parseInt(values[1]); //the interval of controller
            cronStatus = parseInt(values[2]); //maybe somebody stops collector
        });

        console.log(process.env.GREEN_COLOR, "initializing all crons processes at " + dateFormat(new Date()) + " with cron interval [" + interval + "ms] and cron Controller interval : [" + intervalControl + "ms]...");
        if (cronStatus) await startCron(interval);
        else console.log(process.env.YELLOW_COLOR, "Cron status in redis indicates we don't want start cron process. we only start cron Controller.");
        await startController(intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot initialize cron with personalized params, we will initialize cron with default params (every 10s, and 60s to reconfig) . . Process continuing... " + error.message);
        ////console.error(error); //continue the execution cron
        await startCron(10000); // 10 seconds
        await startController(60000); // 60 seconds
        cronStatus = 1;
    }
}

module.exports = { initCron }