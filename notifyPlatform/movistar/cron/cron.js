

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
var cronStatus = 1; //status of cron. 0: cron stopped, 1 : cron working, 
var intervalControl = 60000; //define interval in controller cron (check by min. by default)
const defaultOperator = "MOV"; //default operator for this collector: "MOV"
const defaultCollector = "collector:" + defaultOperator; // default collector, for configurations
var operator = defaultOperator; //default operator for this collector: "MOV"
var channel0 = buildChannel(operator, 0);
var channel1 = buildChannel(operator, 1);
var channel2 = buildChannel(operator, 2);
var channel3 = buildChannel(operator, 3);

const startCron = async (interval) => {
    try {
        console.log(process.env.GREEN_COLOR, "initializing cron at " + dateFormat(new Date()) + " with interval : " + interval);
        var counter = 0;
        cron = setInterval(function () {
            console.log(" cron executing num:" + counter++);
            sendNextSMS();
        }, interval);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot start cron . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const stopCron = async () => {
    try {
        console.log(process.env.YELLOW_COLOR, "Stoping cron at " + dateFormat(new Date()));
        clearInterval(cron);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot stop cron. Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const sendNextSMS = async () => {


    try {
        const smsJSON = await nextSMS(); //get message with rpop command from SMS.MOV.1, 2, 3 
        if (smsJSON != null) {
            const sms = new Sms(JSON.parse(smsJSON)); // convert json to object
            //sms.validate(); It's unnecessary.
            if (operator != defaultOperator) { //If we change operator for contingency we change sms to other list
                await rpoplpush(buildChannel(defaultOperator,sms.priority), buildChannel(operator,sms.priority));
                console.log(process.env.YELLOW_COLOR,"change SMS " + sms._id +" from "+defaultOperator+" to "+operator);
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
        let sms = await rpop(channel0);
        if (sms == null) {
            sms = await rpop(channel1);
            if (sms == null) {
                sms = await rpop(channel2);
                if (sms == null) {
                    sms = await rpop(channel3);
                    if (sms == null) {
                        return null;
                    } else { return sms; }
                } else return sms;
            } else return sms;
        } else return sms;
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
    await checkstatus();
    await checkInterval();
    await checkOperator();
}
const checkstatus = async () => { //Check status, if it's necessary finish cron because redis say it.
    try {

        let newcronStatus = parseInt(await hget(defaultCollector, "status"));  //0 stop, 1 OK.  //finish because redis say it 
        if (newcronStatus != cronStatus) {
            cronStatus = newcronStatus;
            if (cronStatus == 0) {
                console.log(process.env.YELLOW_COLOR, "Stoping Movistar cron...");
                await stopCron();
            } else if (cronStatus == 1) {
                console.log(process.env.GREEN_COLOR, "Re-starting Movistar cron...");
                await startCron(interval);
            }
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot change status (run/stop cron). current cron status = " + cronStatus + " . . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const checkInterval = async () => { //check rate/s, and change cron rate
    try {
        let newInterval = parseInt(await hget(defaultCollector, "interval"));  //rate/s //change cron rate    
        if (newInterval != interval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, "Re-starting Movistar cron and changing rate/interval: old rate " + interval + " , new rate : " + newInterval);
            interval = newInterval;
            if (cronStatus == 1) {
                await stopCron();
                await startCron(interval);
            }
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
        interval = parseInt(await hget(defaultCollector, "interval")); //The rate/interval of main cron
        intervalControl = parseInt(await hget(defaultCollector, "intervalControl")); //the interval of controller
        cronStatus = parseInt(await hget(defaultCollector, "status")); //maybe somebody stops collector
        console.log(process.env.GREEN_COLOR, "initializing all crons processes at " + dateFormat(new Date()) + " with cron interval [" + interval + "ms] and cron Controller interval : [" + intervalControl + "ms]...");
        if (cronStatus == 1) await startCron(interval);
        else console.log(process.env.YELLOW_COLOR, " status in redis indicates we don't start cron process. we only start cron Controller.");

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