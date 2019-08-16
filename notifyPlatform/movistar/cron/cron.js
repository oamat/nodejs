

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const Sms = require('../models/sms');
const { hget, rpop, rpoplpush } = require('../util/redis'); //we need to initialize redis
const { dateFormat, buildChannel } = require('../util/formats'); // utils for formats
const { updateSMS, sendSMS } = require('./cronHelper');


//Variables
var cron; //the main cron that send message to the operator.
var interval = 10; //define the rate/s notifications, interval in cron (100/s by default)
var intervalChanged = false; // if interval(rate) change
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var cronChanged = false;  //if we need restart cron, 

var intervalControl = 60000; //define interval in controller cron (check by min. by default)
const defaultOperator = "MOV"; //default operator for this collector: "MOV"
const defaultCollector = "collector:" + defaultOperator; // default collector, for configurations
var operator = defaultOperator; //default operator for this collector: "MOV"

var channel0 = buildChannel(operator, 0);
var channel1 = buildChannel(operator, 1);
var channel2 = buildChannel(operator, 2);
var channel3 = buildChannel(operator, 3);

const startCron = async (interval) => { //Start cron only when cron is stopped.
    try {
        console.log(process.env.GREEN_COLOR, "initializing cron at " + dateFormat(new Date()) + " with interval : " + interval);
        var counter = 0;
        if (!cron) {
            cron = setInterval(function () {
                console.log(" cron executing num:" + counter++);
                sendNextSMS();
            }, interval);
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot start cron . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const stopCron = async () => { //stop cron only when cron is switched on
    try {
        console.log(process.env.YELLOW_COLOR, "Stoping cron at " + dateFormat(new Date()));
        if (cron) clearInterval(cron);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot stop cron. Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const sendNextSMS = async () => {
    try {
        const smsJSON = await nextSMS(); //get message with rpop command from SMS.MOV.1, 2, 3 
        if (smsJSON) {
            const sms = new Sms(JSON.parse(smsJSON)); // convert json to object
            //sms.validate(); It's unnecessary.
            if (operator != defaultOperator) { //If we change operator for contingency we change sms to other list
                await rpoplpush(buildChannel(defaultOperator, sms.priority), buildChannel(operator, sms.priority));
                console.log(process.env.YELLOW_COLOR, "change SMS " + sms._id + " from " + defaultOperator + " to " + operator);
            } else {
                await sendSMS(sms); // send SMS to operator
                updateSMS(sms._id); // update SMS in MongoDB
            }
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we have a problem in sendNextSMS() : " + error.message);
        console.error(error); //continue the execution cron
    }
}

const nextSMS = async () => {
    try {
        return await rpop(channel0) || await rpop(channel1) || await rpop(channel2) || await rpop(channel3); //return the next sms by priority order.     
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we have a problem with redis rpop : " + error.message);
        console.error(error); //continue the execution cron
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
        console.error(error); //continue the execution cron
    }
}


const checksController = async () => {
    await Promise.all([
        checkstatus(),
        checkInterval(),
        checkOperator()
    ]);

    if (cronChanged) { //some param changed in cron, we need to restart or stopped.
        if (cronStatus) { //cron must to be started            
            console.log(process.env.GREEN_COLOR, "Re-Start Movistar cron...");
            cronChanged = false;
            await stopCron();
            await startCron(interval);
        } else { //cron must to be stopped
            console.log(process.env.YELLOW_COLOR, "Stoping Movistar cron...");
            cronChanged = false;
            await stopCron(); //if I stop cron N times, it doesn't matter... 
        }
    }


}
const checkstatus = async () => { //Check status, if it's necessary finish cron because redis say it.
    try {
        let newCronStatus = parseInt(await hget(defaultCollector, "status"));  //0 stop, 1 OK.  //finish because redis say it 
        if (cronStatus != newCronStatus) {
            cronStatus = newCronStatus;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot change status (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const checkInterval = async () => { //check rate/s, and change cron rate
    try {
        let newInterval = parseInt(await hget(defaultCollector, "interval"));  //rate/s //change cron rate    
        if (interval != newInterval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, "Change rate/interval: old rate " + interval + " , new rate : " + newInterval + " , next restart will be effect.");
            interval = newInterval;
            cronChanged = true;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot change rate (cron interval). current interval " + interval + " . . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const checkOperator = async () => { //change operator for HA
    try {
        let newOperator = await hget(defaultCollector, "operator");  //"MOV", "VOD", "ORA",... //change operator for HA
        if (newOperator.toString().trim() != operator) {
            console.log(process.env.YELLOW_COLOR, "Change operator " + operator + " for " + newOperator);
            channel0 = buildChannel(newOperator, 0);
            channel1 = buildChannel(newOperator, 1);
            channel2 = buildChannel(newOperator, 2);
            channel3 = buildChannel(newOperator, 3);
            operator = newOperator;
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot change operator because a problem, actual operator : " + operator + " . . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const initCron = async () => {
    try {
        await Promise.all([
            hget(defaultCollector, "interval"),
            hget(defaultCollector, "intervalControl"),
            hget(defaultCollector, "status"),
        ]).then((values) => {
            interval = parseInt(values[0]); //The rate/interval of main cron
            intervalControl = parseInt(values[1]); //the interval of controller
            cronStatus = parseInt(values[2]); //maybe somebody stops collector
        });

        console.log(process.env.GREEN_COLOR, "initializing all crons processes at " + dateFormat(new Date()) + " with cron interval [" + interval + "ms] and cron Controller interval : [" + intervalControl + "ms]...");
        if (cronStatus) await startCron(interval);
        else console.log(process.env.YELLOW_COLOR, " status in redis indicates we don't want start cron process. we only start cron Controller.");
        await startController(intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot initialize cron with personalized params, we will initialize cron with default params (100message/s & 60s to reconfig) . . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
        await startCron(10); // 100 message/s
        await startController(60000); // 60 seconds
        cronStatus = 1;
    }
}

module.exports = { initCron }