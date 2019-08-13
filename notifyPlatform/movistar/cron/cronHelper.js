
/*
 * CronHelper for notify Platform 
 *
 */

"use strict";

//Dependencies
const https = require('https');
const Sms = require('../models/sms');




const updateSMS = async (id) => {
    Sms.findOneAndUpdate(id, {
        $set: {
            status: 1,  //0:notSent, 1:Sent, 2:confirmed 3:Error
            dispatched: true,
            dispatchedAt: new Date()
        }
    }, { new: true }, (error, result) => {
        if (error) console.log(error.message);
        else console.log(" update SMS : " + JSON.stringify(result));
    });
}

const sendSMS = async (sms) => {
    const options = {
        hostname: 'encrypted.google.com',
        port: 443,
        path: '/sendSMS',
        method: 'POST',
        body: JSON.stringify(sms)
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
module.exports = { updateSMS, sendSMS }