
/*
 * CronHelper for notify Platform 
 *
 */

"use strict";

//Dependencies
const https = require('https');
const { logTime } = require('../util/formats');




const sendSMS = async (sms) => {
    const options = {
        hostname: 'encrypted.google.com',
        port: 443,
        path: '/sendSMS',
        method: 'POST',
        body: JSON.stringify(sms)
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
module.exports = { sendSMS }