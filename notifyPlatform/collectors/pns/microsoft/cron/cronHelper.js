
/*
 * CronHelper for notify Platform 
 *
 */

"use strict";

//Dependencies
const https = require('https');
const { logTime } = require('../util/formats');

const sendPNS = async (pns) => {
    let body = JSON.stringify(pns);
    const options = {
        hostname: 'encrypted.google.com',
        port: 443,
        path: '/sendPNS',
        method: 'POST',
        headers: { 'Content-Length': body.length, 'Content-Type': 'application/json', 'AccessToken' : pns.token },
        body: body
    };
   
    const request = https.request(options, (response) => {
        //console.log('statusCode:', response.statusCode);
        //console.log('headers:', response.headers);
        
        response.on('data', (data) => {
            //process.stdout.write(data);
        });
    });

    request.on('error', (error) => {
        console.error(logTime(new Date()) + error.message);
    });
    request.end();

    
}
module.exports = { sendPNS }