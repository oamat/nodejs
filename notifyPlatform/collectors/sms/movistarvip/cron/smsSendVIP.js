
/*
 * CronHelper for notify Platform 
 *
 */

"use strict";

//Dependencies
const https = require('https');
const { logTime } = require('../util/formats');

const sendSMS = async (sms) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        let body = JSON.stringify(sms);
        const options = {
            hostname: 'encrypted.google.com',
            port: 443,
            path: '/sendSMS',
            method: 'POST',
            headers: { 'Content-Length': body.length, 'Content-Type': 'application/json', 'AccessToken': sms.token },
            body: body
        };

        // const request = https.request(options, (response) => {
        //     //console.log('statusCode:', response.statusCode);
        //     //console.log('headers:', response.headers);
        //     //console.log('data:', response.data);
        //     resolve(1);
        //     response.on('data', (data) => {
        //         //process.stdout.write(data);
        //     });
        // });

        // request.on('error', (error) => {
        //     //console.error(logTime(new Date()) + error.message);
        //     reject(new Error(error));
        // });
        // request.end();

        setTimeout(() => { resolve(1); }, 1); //For testing
    });
}
module.exports = { sendSMS }