

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const { sismember } = require('../util/redispns'); //we need to initialize redis
const { rclient } = require('../config/redispns');
const { hgetall, hset, hincrby1 } = require('../util/redisconf');
const { dateFormat, logTime } = require('../util/formats'); // utils for formats
const { findAllPNS } = require('../util/mongopns'); // utils for formats

//Variables
const PNS_IDS = "PNS.IDS.PENDING";
const retryName = "collectorpns:retriesPNS"
const limit = 100;
var cronConf; //the redis cron configuration
var cron; //the main cron that send message to the operator.
var cronController;  //the Controller cron that send message to the operator.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron, 
var cronControllerChanged = false; //if we need restart cron, we use this control var
var interval = 1000; //define the rate/s notifications, interval in cron (100/s by default)
var intervalControl = 30000; //define interval in controller cron (check by min. by default)




const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing RETRIESPNS cronMain with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "RETRIESPNS cronMain is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "RETRIESPNS cron executing ");
                retryNextsPNS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start RETRIESPNS cron." + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping RETRIESPNS cronMain ");
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop RETRIESPNS cronMain. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const retryNextsPNS = async () => {
    try {
        const retriesPNS = await nextRetriesPNS(); //get array of PNS not sent.
        //if (retriesPNS.length > 0) console.log(process.env.GREEN_COLOR, logTime(new Date()) + "INFO: We have found " + retriesPNS.length + " PNS with possible delay. The lowest priority found:[" + retriesPNS[0].priority+"]");
        for (var i = 0; i < retriesPNS.length; i++) {
            if (await sismember(PNS_IDS, retriesPNS[i]._id) == 0) {
                let id = retriesPNS[i]._id
                //START Redis Transaction with multi chain and result's callback
                rclient.multi([
                    ["lpush", retriesPNS[i].channel, JSON.stringify(retriesPNS[i])],    //Trans 1
                    ["sadd", PNS_IDS, retriesPNS[i]._id]                      //Trans 2             
                ]).exec(function (error, replies) { // drains multi queue and runs atomically                    
                    let date = logTime(new Date());
                    if (error) {
                        console.log(process.env.YELLOW_COLOR, date + "WARNING: We couldn't save PNS in Redis (We will have to wait for retry): " + error.message);
                        hincrby1("collectorpns:retriesPNS", "errors");
                    } else {
                        console.log(process.env.GREEN_COLOR, date + "We have retried " + retriesPNS[i]._id);
                        hincrby1("collectorpns:retriesPNS", "processed");
                    }
                });
                //END Redis Transaction with multi chain and result's callback  
            }
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in retryNextsPNS() : " + error.message);
        hincrby1("collectorpns:retriesPNS", "errors");
        //console.error(error); //continue the execution cron
    }
}

const nextRetriesPNS = async () => {
    try {
        let end = new Date();
        let start = new Date();
        start.setDate(start.getDate() - 1); // date from 24h before
        end.setSeconds(end.getSeconds() - 15);  //to now -30seconds, because we have the risk that take a message immediately after we sended
        let condition = {  //query condition 
            dispatched: false, //not dispatched
            expired: null, //not expired
            status: 0, // not sent
            //operator: operator, // the operator
            retries: { '$lt': 10 },// retries less than 10
            receivedAt: { '$gte': start, '$lte': end } //receivedAt greater than 24h before and less than now-30s.            
        };

        let options = { skip: 0, limit, sort: { priority: 1, receivedAt: -1 } }; //skip (Starting Row), limit (Ending Row), Sort by priority ASC (->0,1,2,3,4,5) and receivedAt DESC (first the oldest)

        return await findAllPNS(condition, options);//return the nexts pns's not sent by priority order.  

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem with mongoose.find : " + error.message);
        hincrby1("collectorpns:retriesPNS", "errors");
        return null;
        //console.error(error); //continue the execution cron
    }
}

const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing RETRIESPNS cronController with intervalControl : " + intervalControl);
        hset(retryName, "last", dateFormat(new Date())); //save first execution in Redis
        if (cronController) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "RETRIESPNS cronController is executing, so we don't need re-start it.");
        } else {
            cronController = setInterval(function () {
                checksController();
            }, intervalControl);
        }
        retryNextsPNS(); // first execution    
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start RETRIESPNS cron Controller. . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const checksController = async () => {
    try {
        cronConf = await hgetall(retryName); //get the cronConf
        if (cronConf && Object.keys(cronConf).length > 1) {
            Promise.all([ //In error case we continue with other tasks
                hset(retryName, "last", dateFormat(new Date())).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }),  //save last execution in Redis, in error case we continue
                checkstatus(cronConf.status).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check status in Redis, in error case we continue
                checkInterval(cronConf.interval).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }), //check interval in Redis, in error case we continue
                checkIntervalControl(cronConf.intervalControl).catch(error => { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + error.message); }) //check intervalControl in Redis, in error case we continue
            ]).then(async () => {
                // Cron Main Check
                if (cronChanged) { //some param changed in cron, we need to restart or stopped.
                    if (cronStatus) { //cron must to be started                       
                        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Stopping and Re-Starting RETRIESPNS cronMain...");
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
                    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stopping and Re-starting RETRIESPNS cronController ");
                    cronControllerChanged = false;
                    clearInterval(cronController);
                    cronController = null;
                    await startController(intervalControl).catch(error => { throw new Error("ERROR in RETRIESPNS cronController." + error.message) });
                }
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "RETRIESPNS cronController : cronMain intervalControl is " + interval + ", cronController interval is " + interval + " and status is " + cronStatus + " ([1:ON, 0:OFF]).");
                if (!cronStatus) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ATTENTION: RETRIESPNS cronMain is OFF");
            });
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find configuration parameters in Redis, we will continue with default params. Process continuing.");
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we have had a problem with RETRIESPNS configuration in Redis. Process continuing... " + error.message);
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
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find RETRIESPNS status in Redis (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async (newInterval) => { //check rate/s, and change cron rate
    try {
        if (newInterval && parseInt(newInterval) != interval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change RETRIESPNS cronMain interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = parseInt(newInterval);
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : we didn't find RETRIESPNS interval in Redis. current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkIntervalControl = async (newIntervalControl) => { //check rate/s, and change cron rate
    try {
        if (newIntervalControl && parseInt(newIntervalControl) != intervalControl) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change RETRIESPNS cronController interval:  " + intervalControl + " for new interval : " + newIntervalControl + " , next restart will be effect.");
            intervalControl = parseInt(newIntervalControl);
            cronControllerChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING  checkIntervalControl: we didn't find RETRIESPNS intervalControl in Redis. current intervalControl " + intervalControl + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const initCron = async () => {
    try {
        cronConf = await hgetall(retryName); // redis conf
        if (cronConf && Object.keys(cronConf).length > 1) {
            if (cronConf.interval) interval = parseInt(cronConf.interval); //The rate/cronMain interval
            if (cronConf.intervalControl) intervalControl = parseInt(cronConf.intervalControl); //the interval of controller
            if (cronConf.status) cronStatus = parseInt(cronConf.status); //maybe somebody stops collector
        } else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We didn't find RETRIESPNS initialization parameters in Redis, we will initialize cron with default params  . . Process continuing. ");

        if (cronStatus) {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "RETRIESPNS cronMain interval [" + interval + "ms], cronController interval : [" + intervalControl + "ms] and status [" + cronStatus + "](1:ON, 0:OFF).");
            await startCron(interval).catch(error => { throw new Error("ERROR in RETRIESPNS cronMain." + error.message) });
        } else {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "RETRIESPNS Redis Configuration status indicates we don't want start cronMain process. we only start cron Controller.");
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "RETRIESPNS cronController : cronMain interval is " + interval + ", cronController intervalControl is " + interval + " and status is " + cronStatus + " ([1:ON, 0:OFF]).");
        }

        await startController(intervalControl).catch(error => { throw new Error("ERROR in RETRIESPNS cronController." + error.message) });

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING : We have a problem in initialization. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        cronStatus = 1;
        startCron(interval); // 180000 ms by default /
        startController(intervalControl); // 60 seconds by default      
    }
}

module.exports = { initCron }