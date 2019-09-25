

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies

const { sismember } = require('../util/redissms'); //we need to initialize redis
const { rclient } = require('../config/redissms');
const { hgetConf, hset, hincrby1 } = require('../util/redisconf');
const { dateFormat, logTime } = require('../util/formats'); // utils for formats
const { findAllSMS } = require('../util/mongosms'); // utils for formats


//Variables
var cron; //the main cron that send message to the operator.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron, 
var interval = 1000; //define the rate/s notifications, interval in cron (100/s by default)
var intervalControl = 30000; //define interval in controller cron (check by min. by default)
var limit = 100;
const SMS_IDS = "SMS.IDS.PENDING";

const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing retriessms cron with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "retriessms cron is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "retriessms cron executing ");
                retryNextsSMS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot start retriessms cron . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping retriesSMS cron ");
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.RED_COLOR, logTime(new Date()) + "ERROR: we cannot stop cron. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const retryNextsSMS = async () => {
    try {
        const retriesSMS = await nextRetriesSMS(); //get array of SMS not sent from different operators.                    
        if (retriesSMS)
            for (var i = 0; i < retriesSMS.length; i++) {
                if (await sismember(SMS_IDS, retriesSMS[i]._id) == 0) {
                    console.log(process.env.GREEN_COLOR, logTime(new Date()) + "retrying SMS " + retriesSMS[i]._id);
                    //START Redis Transaction with multi chain and result's callback
                    rclient.multi([
                        ["lpush", retriesSMS[i].channel, JSON.stringify(retriesSMS[i])],    //Trans 1
                        ["sadd", SMS_IDS, retriesSMS[i]._id]                      //Trans 2             
                    ]).exec(function (error, replies) { // drains multi queue and runs atomically                                   
                        if (error) {
                            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: We couldn't save SMS in Redis (We will have to wait for retry): " + error.message);
                            hincrby1("collectorsms:retriesSMS", "errors");
                        } else {
                            console.log(process.env.GREEN_COLOR, date + "We have retried " + retriesSMS[i]._id);
                            hincrby1("collectorsms:retriesSMS", "processed");
                        }
                    });
                    //END Redis Transaction with multi chain and result's callback    
                }
            }

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in retryNextsSMS() : " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const nextRetriesSMS = async () => {
    try {
        let end = new Date();
        let start = new Date();
        start.setDate(start.getDate() - 1); // date from 24h before
        end.setSeconds(end.getSeconds() - 30);  //to now -30sconds, because we have the risk that take a message immediately after we sended
        let condition = {  //query condition 
            dispatched: false, //not dispatched
            expired: null, //not expired
            status: 0, // not sent
            //operator: operator, // the operator
            retries: { '$lt': 10 },// retries less than 10
            receivedAt: { '$gte': start, '$lte': end } //receivedAt greater than 24h before and less than now-30s.            
        };

        let options = { skip: 0, limit, sort: { priority: 1, receivedAt: -1 } }; //skip (Starting Row), limit (Ending Row), Sort by priority ASC (->0,1,2,3,4,5) and receivedAt DESC (first the oldest)

        return await findAllSMS(condition, options);//return the nexts sms's not sent by priority order.  

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem with mongoose.find : " + error.message);
        return null;
        //console.error(error); //continue the execution cron
    }
}

const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing cronController with intervalControl : " + intervalControl);
        hset("collectorsms:retriesSMS", "last", dateFormat(new Date())); //save first execution in Redis
        var cronController = setInterval(function () {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "cronController executing: Main cron interval is " + interval + " and status is " + cronStatus + " [1:ON, 0:OFF].");
            hset("collectorsms:retriesSMS", "last", dateFormat(new Date())); //save last execution in Redis
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
        checkInterval()
    ]);

    if (cronChanged) { //some param changed in cron, we need to restart or stopped.
        if (cronStatus) { //cron must to be started                       
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Re-Start retriesSMS cron...");
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
        let newCronStatus = parseInt(await hgetConf("collectorsms:retriesSMS", "status"));  //0 stop, 1 OK.  //finish because redis say it 
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
        let newInterval = parseInt(await hgetConf("collectorsms:retriesSMS", "interval"));  //rate/s //change cron rate    
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
            hgetConf("collectorsms:retriesSMS", "interval"),
            hgetConf("collectorsms:retriesSMS", "intervalControl"),
            hgetConf("collectorsms:retriesSMS", "status"),
        ]).then((values) => {
            interval = parseInt(values[0]); //The rate/Main cron interval
            intervalControl = parseInt(values[1]); //the interval of controller
            cronStatus = parseInt(values[2]); //maybe somebody stops collector
        });

        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing all crons processes with cron interval [" + interval + "ms] and cron Controller interval : [" + intervalControl + "ms]...");
        if (cronStatus) await startCron(interval);
        else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Cron status in redis indicates we don't want start cron process. we only start cron Controller.");
        await startController(intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: we didn't find initialize params, we will initialize cron with default params  . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        await startCron(interval); // 100 message/s
        await startController(intervalControl); // 60 seconds
        cronStatus = 1;
    }
}

module.exports = { initCron }