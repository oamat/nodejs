

/*
 * Cron for notify Platform 
 *
 */

"use strict";

const initCron = (interval) => {
    console.log("init cron at " + new Date());  
    var cron = setInterval(function () {
        console.log("cron executing");
        
        //TODO:  finish because redis say it  //clearInterval(cron);
        //TODO: get message with lpop command from SMS.MOV.1
        //TODO: send message to operator
        //TODO: update message to mongodb
    }, interval);
}

module.exports = { initCron }