

/*
 * Cron for notify Platform 
 *
 */

"use strict";

//Dependencies
const { hget, rpop, rpoplpush } = require('../util/redis'); //we need to initialize redis
const { dateFormat, buildChannel } = require('../util/formats'); // utils for formats
//Variables
var cron; //the main cron that send message to the operator.
var interval = 100; //define the rate/s notifications, interval in cron (100/s by default)
var cronState = 1; //State of cron. 0: cron stopped, 1 : cron working, 
var intervalControl = 60000; //define interval in controller cron (check by min. by default)
const defaultOperator = "MOV"; //default operator for this collector: "MOV"
var operator = defaultOperator; //default operator for this collector: "MOV"
var channel1 = buildChannel(operator, 1);
var channel1 = buildChannel(operator, 2);
var channel1 = buildChannel(operator, 3);

const startCron = async (interval) => {
    try {
        console.log(process.env.GREEN_COLOR, "initializing cron at " + dateFormat(new Date()) + " with interval : " + interval);
        cron = setInterval(function () {
            console.log(" cron executing");
            //TODO: get message with lpop command from SMS.MOV.1, 2, 3 
            //TODO: send message to operator or change collector
            //TODO: update message to mongodb
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


const startController = async (intervalControl) => {
    try {
        console.log(process.env.GREEN_COLOR, "initializing cronController at " + dateFormat(new Date()) + " with intervalControl : " + intervalControl);
        var cronController = setInterval(function () {
            console.log("cronController executing");
            checkState();
            checkInterval();
            checkOperator();
        }, intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot start cron Controller. . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}



const checkState = async () => { //Check state, if it's necessary finish cron because redis say it.
    try {
        let newCronState = parseInt(await hget("collector:MOV", "state"));  //0 stop, 1 OK.  //finish because redis say it 
        if (newCronState != cronState) {
            cronState = newCronState;
            if (cronState == 0) {
                console.log(process.env.YELLOW_COLOR, "Stoping Movistar cron...");
                await stopCron();
            } else if (cronState == 1) {
                console.log(process.env.GREEN_COLOR, "Re-starting Movistar cron...");
                await startCron();
            }
        }
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot change state (run/stop cron). current cron state = " + cronState + " . . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
    }
}

const checkInterval = async () => { //check rate/s, and change cron rate
    try {
        let newInterval = parseInt(await hget("operator:MOV", "interval"));  //rate/s //change cron rate    
        if (newInterval != interval) { //if we change the interval -> rate/s
            console.log(process.env.YELLOW_COLOR, "Re-starting Movistar cron and changing rate/interval: old rate " + interval + " , new rate : " + newInterval);
            interval = newInterval;
            if (cronState == 1) {
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
        let newOperator = await hget(defaultOperator, "operator");  //"MOV", "VOD", "ORA",... //change operator for HA
        if (newOperator.toString().trim() != operator) {
            console.log(process.env.YELLOW_COLOR, "Change operator " + operator + " for " + newOperator);
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
        interval = parseInt(await hget("collector:MOV", "interval"));
        intervalControl = parseInt(await hget("MOV", "intervalControl"));
        cronState = parseInt(await hget("MOV", "state"));
        console.log(process.env.GREEN_COLOR, "initializing all crons processes at " + dateFormat(new Date()) + " with cron interval [" + interval + "ms] and cron Controller interval : [" + intervalControl + "ms]...");
        if (cronState == 1) await startCron(interval);
        else console.log(process.env.YELLOW_COLOR, " State in redis indicates we don't start cron process. we only start cron Controller.");

        await startController(intervalControl);
    } catch (error) {
        console.log(process.env.YELLOW_COLOR, "ERROR: we cannot initialize cron with personalized params, we will initialize cron with default params (100message/s & 60s to reconfig) . . Process continuing... " + error.message);
        console.error(error); //continue the execution cron
        await startCron(100); // 100 message/s
        await startController(60000); // 60 seconds
        cronState = 1;
    }
}


module.exports = { initCron }