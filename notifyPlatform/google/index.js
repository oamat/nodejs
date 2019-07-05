'use strict'; // Whole-script strict mode syntax

console.log("starting google colector");
var counter = 0;
var rate = 110; //rate in num msg/second from Redis
const millisXSecond = 1000;
var processnum = 0;
var time = Math.floor(Date.now() / millisXSecond); // total seconds; Math.floor returns greatest integer; The Date.now() returns number of millis elapsed since January 1, 1970 00:00:00 UTC.   

function cron() {
    processnum++;
    var newtime = Math.floor(Date.now() / millisXSecond) - time; // total seconds transcurred since start program
    console.log("counter:" + counter++ + ", second: " + newtime);
    
    if ( processnum < rate) {         
        //DO ACTIONS, IMPORTANT: You have to taking to account exceptions or errors (need to do "processnum--;")
        //console.log ( " Retrieve and Send message! processum = " + processnum);   
    }
    
    processnum--;
}

setInterval(cron, Math.floor(millisXSecond/rate)); //Nodejs API: https://nodejs.org/api/timers.html
