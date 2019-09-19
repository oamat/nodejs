

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies

const { sadd, sismember, lpush } = require('../util/redispns'); //we need to initialize redis
const { hget, hset } = require('../util/redisconf');
const { dateFormat, logTime } = require('../util/formats'); // utils for formats
const { findAllPNS } = require('../util/mongopns'); // utils for formats


//Variables
var cron; //the main cron that send message to the operator.
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron, 
var interval = 1000; //define the rate/s notifications, interval in cron (100/s by default)
var intervalControl = 30000; //define interval in controller cron (check by min. by default)
var limit = 100;

const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing retriespns cron at " + dateFormat(new Date()) + " with interval : " + interval);
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "retriespns cron is executing, so we don't need re-start it.");
        } else {
            cron = setInterval(function () {
                //console.log(logTime(new Date()) + "retriespns cron executing ");
                retryNextsPNS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we cannot start retriespns cron . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        if (cron) {
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Stoping retriesPNS cron at " + dateFormat(new Date()));
            clearInterval(cron);
            cron = null;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we cannot stop cron. Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const retryNextsPNS = async () => {
    try {
        const retriesPNS = await nextRetriesPNS(); //get array of PNS not sent. 
        let counter = 0;

        for (var i = 0; i < retriesPNS.length; i++) {
            if (await sismember("PNS.IDS.PENDING", retriesPNS[i]._id) == 0) {
                // START 2 "tasks" in parallel. Even when we recollect the errors we continue the execution and return OK.
                await Promise.all([
                    lpush(retriesPNS[i].channel, JSON.stringify(retriesPNS[i])).catch(error => { return error }),  //put pns to the the apropiate lists channels: PNS.MOV.1, PNS.VIP.1, PNS.ORA.1, PNS.VOD.1 (1,2,3) 
                    sadd("PNS.IDS.PENDING", retriesPNS[i]._id).catch(error => { return error }),         //we save the _id in a SET, for checking the retries, errors, etc.  
                ]).then(values => {
                    if (values[0] instanceof Error) { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: We cannot save PNS in Redis LIST (lpush): " + values[0].message); }  //lpush returns error
                    if (values[1] instanceof Error) { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: We cannot save PNS in Redis SET (sadd): " + values[1].message); } //sadd returns error          
                });
                // END the 2 "tasks" in parallel    
                counter++;
            }
        }

        if (counter) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "We have retried " + counter + " PNS that were not found in REDIS.");
        //else console.log(process.env.GREEN_COLOR, logTime(new Date()) + "We don't find any PNS to retry.");

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem in retryNextsPNS() : " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const nextRetriesPNS = async () => {
    try {  //priority
        let dateFrom = new Date();
        let dateTo = new Date();
        dateFrom.setDate(dateFrom.getDate() - 1); // date from 24h before
        dateTo.setSeconds(dateTo.getSeconds() - 30);  //to now -30sconds, because we have the risk that take a message immediately after we sended

        let condition = {  //query condition 
            dispatched: false, //not dispatched
            expired: null, //not expired
            status: 0, // not sent
            retries: { $lt: 10 },// retries less than 10
            receivedAt: { $gte: dateFrom.toISOString(), $lt: dateTo.toISOString() } // receivedAt great than 24h before.
        };

        let options = { skip: 0, limit, sort: { priority: 1 } }; //skip (Starting Row), limit (Ending Row), Sort by priority ASC

        return await findAllPNS(condition, options);//return the nexts pns's not sent by priority order.  

    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we have a problem with mongoose.find : " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing cronController at " + dateFormat(new Date()) + " with intervalControl : " + intervalControl);
        hset("collectorpns:retriesPNS", "last", dateFormat(new Date())); //save first execution in Redis
        var cronController = setInterval(function () {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "cronController executing: Main cron interval is " + interval + " and status is " + cronStatus + " [1:ON, 0:OFF].");
            hset("collectorpns:retriesPNS", "last", dateFormat(new Date())); //save last execution in Redis
            checksController();
        }, intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we cannot start cron Controller. . Process continuing... " + error.message);
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
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Re-Start retriesPNS cron...");
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
        let newCronStatus = parseInt(await hget("collectorpns:retriesPNS", "status"));  //0 stop, 1 OK.  //finish because redis say it 
        if (cronStatus != newCronStatus) {
            cronStatus = newCronStatus;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we cannot change status (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}

const checkInterval = async () => { //check rate/s, and change cron rate
    try {
        let newInterval = parseInt(await hget("collectorpns:retriesPNS", "interval"));  //rate/s //change cron rate    
        if (interval != newInterval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Change interval:  " + interval + " for new interval : " + newInterval + " , next restart will be effect.");
            interval = newInterval;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we cannot change rate (cron interval). current interval " + interval + " . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
    }
}


const initCron = async () => {
    try {
        await Promise.all([
            hget("collectorpns:retriesPNS", "interval"),
            hget("collectorpns:retriesPNS", "intervalControl"),
            hget("collectorpns:retriesPNS", "status"),
        ]).then((values) => {
            interval = parseInt(values[0]); //The rate/Main cron interval
            intervalControl = parseInt(values[1]); //the interval of controller
            cronStatus = parseInt(values[2]); //maybe somebody stops collector
        });

        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "initializing all crons processes at " + dateFormat(new Date()) + " with cron interval [" + interval + "ms] and cron Controller interval : [" + intervalControl + "ms]...");
        if (cronStatus) await startCron(interval);
        else console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "Cron status in redis indicates we don't want start cron process. we only start cron Controller.");
        await startController(intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: we cannot initialize cron with personalized params, we will initialize cron with default params (100message/s & 60s to reconfig) . . Process continuing... " + error.message);
        //console.error(error); //continue the execution cron
        await startCron(interval); // 100 message/s
        await startController(intervalControl); // 60 seconds
        cronStatus = 1;
    }
}

module.exports = { initCron }