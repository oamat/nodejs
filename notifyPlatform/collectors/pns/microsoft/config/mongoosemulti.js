/*
 * Multi DB configuration SMS & PNS for APIADMIN
 *
 */

"use strict";

// Dependencies
const mongoose = require('mongoose');
const { smsSchema } = require('../models/sms');
const { pnsSchema } = require('../models/pns');
const { contractSchema } = require('../models/contract');
const { logTime } = require('../util/formats');

//VARS
var Sms, Pns, ContractSms, ContractPns;
var dbSMS, dbPNS;
const options = { //options for connection to MongoDB
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    poolSize: 5,
    dbName: "notifyplatform",
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE
};


//CREATE CONNECTIONS
const initSMSMongooseConnection = async () => {
    //create connection //For MongoDB SMS 
    dbSMS = mongoose.createConnection(process.env.MONGODBSMS_URI, options, (error, result) => {
        if (error) console.error(process.env.RED_COLOR, logTime(new Date()) + error.message);
    });

    //EVENT EMITTER MONGODB SMS
    dbSMS.on('connected', () => {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Connected to SMS MongoDB Server : " + process.env.MONGODBSMS_URI);
        dbSMS.model('Sms', smsSchema, 'sms'); //we use the common Schema of PNS
        Sms = dbSMS.model('Sms');
        dbSMS.model('Contract', contractSchema, 'contract'); //we use the common Schema of PNS
        ContractSms = dbSMS.model('Contract');
    });
    dbSMS.on('error', (error) => {  //we need to know if connection works, particularly at the start if we didn't connect with it.
        //console.log(process.env.RED_COLOR, error);
        //console.log(process.env.RED_COLOR, "MONGODB ERROR : failed to connect to db server : " + process.env.MONGODBSMS_URI + " . " + error.message);
        //process.exit(1);  //because platform doesn't works without Mongodb, we prefer to stop server
        let date = new Date();
        console.log(process.env.RED_COLOR, logTime(date) + " MONGODB SMS ERROR : failed to connect to SMS mongodb server : " + process.env.MONGODBSMS_URI);
        console.log(process.env.YELLOW_COLOR, logTime(date) + " MONGODB SMS ERROR : we will try to connect to SMS mongodb in 15s...");
        setTimeout(function () {
            initSMSMongooseConnection();  //create connection //For MongoDB SMS 
        }, 15000);
    });
}

const initPNSMongooseConnection = async () => {
    //create connection //For MongoDB PNS
    dbPNS = mongoose.createConnection(process.env.MONGODBPNS_URI, options, (error, result) => {
        if (error) console.error(process.env.RED_COLOR, logTime(new Date()) + error.message);
    });

    //EVENT EMITTER MONGODB PNS
    dbPNS.on('connected', () => {
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Connected to PNS MongoDB Server : " + process.env.MONGODBPNS_URI);
        dbPNS.model('Pns', pnsSchema, 'pns');  //we use the common Schema of PNS
        Pns = dbPNS.model('Pns');
        dbPNS.model('Contract', contractSchema, 'contract'); //we use the common Schema of PNS
        ContractPns = dbPNS.model('Contract');
    });
    dbPNS.on('error', (error) => {  //we need to know if connection works, particularly at the start if we didn't connect with it.
        //console.log(process.env.RED_COLOR, error);
        //console.log(process.env.RED_COLOR, "MONGODB ERROR : failed to connect to db server : " + process.env.MONGODBSMS_URI + " . " + error.message);
        //process.exit(1);  //because platform doesn't works without Mongodb, we prefer to stop server   
        let date = new Date();
        console.log(process.env.RED_COLOR, logTime(date) + " MONGODB PNS ERROR : failed to connect to PNS mongodb server : " + process.env.MONGODBPNS_URI);
        console.log(process.env.YELLOW_COLOR, logTime(date) + " MONGODB PNS ERROR : we will try to connect to PNS mongodb in 15s...");
        setTimeout(function () {
            initPNSMongooseConnection();   //create connection //For MongoDB PNS
        }, 15000);
    });
}

initSMSMongooseConnection();
initPNSMongooseConnection();
module.exports = { Sms, Pns, ContractSms, ContractPns };