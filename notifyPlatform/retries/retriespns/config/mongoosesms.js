/*
 * DB configuration
 *
 */

"use strict";

// Dependencies
const mongoose = require('mongoose');
const { logTime } = require('../util/formats');

//Vars
const options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    poolSize: process.env.MONGODBSMS_POOL,
    dbName: "notifyplatform",
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    useUnifiedTopology: true
};

// Init mongoose
//mongoose.Promise = global.Promise; This is legacy code from older examples that isn't needed with Mongoose 5.

// // EventEmitter in case of Errors, stop all process
// mongoose.connection.once('open', () => { //we check the mongodb connection
//     console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Connected to SMS MongoDB Server : " + process.env.MONGODBSMS_URI);
// });

// mongoose.connection.on('error', (error) => {  //we need to know if connection works, particularly at the start if we didn't connect with it.
//     //console.log(process.env.RED_COLOR, error);
//     //console.log(process.env.RED_COLOR, "MONGODB ERROR : failed to reconnect to db server : " + process.env.MONGODBSMS_URI + " . " + error.message);
//     //process.exit(1);  //because platform doesn't works without Mongodb, we prefer to stop server
//     let date = new Date();
//     console.log(process.env.RED_COLOR, logTime(date) + " MONGODB SMS ERROR : failed to reconnect to SMS mongodb server : " + process.env.MONGODBSMS_URI);
//     console.log(process.env.YELLOW_COLOR, logTime(date) + " MONGODB SMS ERROR : we will try to reconnect to SMS mongodb in 15s...");
//     setTimeout(function () {
//         initializeMongooseConnection();
//     }, 15000);
// });

const initializeMongooseConnection = async () => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        //CREATE CONNECTION : create connection //For MongoDB SMS 
        mongoose.connect(process.env.MONGODBSMS_URI, options, (error, result) => {
            if (error) {
                let date = new Date();
                console.log(process.env.RED_COLOR, logTime(date) + " MONGODB SMS ERROR : failed to reconnect to SMS mongodb server : " + process.env.MONGODBSMS_URI);
                console.log(process.env.YELLOW_COLOR, logTime(date) + " MONGODB SMS ERROR : we will try to reconnect to SMS mongodb in 15s...");
                setTimeout(function () {
                    initializeMongooseConnection();
                }, 15000);
                //console.log(process.env.RED_COLOR, error);
                //console.log(process.env.RED_COLOR, "MONGODB ERROR : failed to reconnect to db server : " + process.env.MONGODBSMS_URI + " . " + error.message);
                //process.exit(1);  //because platform doesn't works without Mongodb, we prefer to stop server
            } else {
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Connected to SMS MongoDB Server : " + process.env.MONGODBSMS_URI);
                resolve(result);
            }
        });
    });  
}

module.exports = { initializeMongooseConnection, mongoose };