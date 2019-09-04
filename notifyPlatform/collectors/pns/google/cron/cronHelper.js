
/*
 * CronHelper for notify Platform 
 *
 */

"use strict";

//Dependencies
const https = require('https');
const { Pns } = require('../models/pns');





const sendPNS = async (pns) => {
    const options = {
        hostname: 'encrypted.google.com',
        port: 443,
        path: '/sendPNS',
        method: 'POST',
        body: JSON.stringify(pns)
    };
   
    const request = https.request(options, (response) => {
        console.log('statusCode:', response.statusCode);
        console.log('headers:', response.headers);
        
        response.on('data', (data) => {
            process.stdout.write(data);
        });
    });

    request.on('error', (error) => {
        console.error(error.message);
    });
    request.end();
}
module.exports = { sendPNS }