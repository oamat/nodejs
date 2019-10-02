
/*
 * CronHelper for notify Platform 
 *
 */

"use strict";

//Dependencies
const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const sendSMS = async (sms) => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks       
        let body = JSON.stringify(sms);
        const options = {
            hostname: 'localhost',
            port: 30010,
            path: '/',
            method: 'POST',
            headers: { 'Content-Length': body.length, 'Content-Type': 'application/json', 'AccessToken': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.-gfH4t4' },
            body: body
        };

        const request = https.request(options, (response) => { //see https://nodejs.org/api/https.html#https_https_request_options_callback
            //console.log('statusCode:', response.statusCode);
            //console.log('headers:', response.headers);
            //console.log('data:', response.data);
            //resolve(1);

            // response.on('data', (data) => {
            //     resolve(1);
            //     //process.stdout.write(data);
            // });
        }).on('error', (error) => {
            console.error(error);
            //console.error(logTime(new Date()) + error.message);
            reject(new Error(error));
        });
        request.end();
        //resolve(1);
        //setTimeout(() => { resolve(1); }, 1); //For testing

        resolve(1);
    });
}
module.exports = { sendSMS }