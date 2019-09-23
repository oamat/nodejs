
/*
 * CronHelper for notify Platform 
 *
 */

"use strict";

//Dependencies
const https = require('https');
const fs = require('fs');


process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const json = {
    "contract": "OTPLOWEB",
    "telf": "+34699272800",
    "message": "you have won a gift",
    "alias": "L.O.",
    "customId": "myid_4566544",
    "priority": "0"
};
const body = JSON.stringify(json);
const options = {
    protocol: 'https:',
    hostname: 'localhost',
    port: 30001,
    path: '/smsSend',
    method: 'POST',
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.cert'),
    headers: { 'Content-Length': body.length, 'Content-Type': 'application/json', 'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.BK58iwYbyfGb1u--SLP3YZP7JZxKSMrPHmdc-gfH4t4' },
    body: body,
    agent: false
};

const array =  new Array();

const TOTAL = 1000;
const LOOP = 5;
const TOTALLOOP = TOTAL*LOOP;
var startTime;
var counter = 0;
var OK = 0;
var err = 0;
const sendSMS = async () => {

    try {


        const request = https.request(options, (response) => { //see https://nodejs.org/api/https.html#https_https_request_options_callback
            console.log(Date.now() + "  statusCode:  ", response.statusCode);
            array.push(Date.now());
            

            // if (counter == TOTALLOOP) {
            //     array.length
            // }

            //console.log('headers:', response.headers);
            //console.log('data:', response.data);
            response.on('data', (data) => {
                //process.stdout.write(data);
                counter++;
                OK++
                if (counter == TOTALLOOP) console.log(" Req. OKs :" + counter + " Req. Err :" + err + " Time :" + (Date.now() - startTime));

                
            });
        });

        request.on('error', (error) => {
            //console.log("entramos en ERROR");
            //console.error(error);
            counter++;
            err++;
            if (counter == TOTALLOOP) console.log(dateFormatWithMillis(new Date()) + " Req. OKs :" + counter + " Req. Err :" + err + " Time :" + (Date.now()- startTime));
        });

        // Add the payload

        request.write(body);

        request.end();

    } catch (error) {
        console.log(error);
    }

    //ATTENTION: if VAGRANT is UP : { Error: read ECONNRESET at _errnoException (util.js:1022:11) at TLSWrap.onread (net.js:628:25) code: 'ECONNRESET', errno: 'ECONNRESET', syscall: 'read' }
}


const start = async () => {    
    for (var i = 0; i < TOTAL; i++) {
        sendSMS();
    }
}


console.log("Preparing performance testing : ");
startTime = Date.now();
for (var j = 0; j < LOOP; j++) {
    start();
}
console.log("Finish performance testing ");