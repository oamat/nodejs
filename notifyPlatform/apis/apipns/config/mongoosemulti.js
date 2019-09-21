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
const { collectorSchema } = require('../models/collector');
const { telfSchema } = require('../models/telf');
const { tokenSchema } = require('../models/token');
const { logTime } = require('../util/formats');


//VARS
var SmsModel, PnsModel, ContractSmsModel, ContractPnsModel, CollectorSmsModel, CollectorPnsModel, TelfSmsModel, TokenPnsModel;

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
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        //CREATE CONNECTION : create connection //For MongoDB SMS 
        mongoose.createConnection(process.env.MONGODBSMS_URI, options, (error, result) => {
            if (error) {
                let date = new Date();
                console.log(process.env.RED_COLOR, logTime(date) + " MONGODB SMS WARNING : failed to reconnect to SMS mongodb server : " + process.env.MONGODBSMS_URI);
                console.log(process.env.YELLOW_COLOR, logTime(date) + " MONGODB SMS ERROR : we will try to reconnect to SMS mongodb in 15s...");
                //process.exit(1);  //because platform doesn't works without Mongodb, we prefer to stop server
                setTimeout(function () {
                    initSMSMongooseConnection();  //create connection //For MongoDB SMS 
                }, 15000);
                //reject(error);
            } else {
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Connected to SMS MongoDB Server : " + process.env.MONGODBSMS_URI);
                result.model('Sms', smsSchema, 'sms'); //we use the common Schema of SMS
                SmsModel = result.model('Sms');
                result.model('Contract', contractSchema, 'contract'); //we use the common Schema of SMS
                ContractSmsModel = result.model('Contract');
                result.model('Collector', collectorSchema, 'collector'); //we use the common Schema of SMS
                CollectorSmsModel = result.model('Collector');
                result.model('Telf', telfSchema, 'telf'); //we use the common Schema of SMS
                TelfSmsModel = result.model('Telf');
                resolve(result);
            }
        });
    });
}

const initPNSMongooseConnection = async () => {
    return new Promise((resolve, reject) => { // we need promise for managing errors and results inside callbacks
        mongoose.createConnection(process.env.MONGODBPNS_URI, options, (error, result) => {
            if (error) {
                let date = new Date();
                console.log(process.env.RED_COLOR, logTime(date) + " MONGODB PNS ERROR : failed to reconnect to PNS mongodb server : " + process.env.MONGODBPNS_URI);
                console.log(process.env.YELLOW_COLOR, logTime(date) + " MONGODB PNS ERROR : we will try to reconnect to PNS mongodb in 15s...");
                //process.exit(1);  //because platform doesn't works without Mongodb, we prefer to stop server
                setTimeout(function () {
                    initPNSMongooseConnection();   //create connection //For MongoDB PNS
                }, 15000);
                //reject(error);
            } else {
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Connected to PNS MongoDB Server : " + process.env.MONGODBPNS_URI);
                result.model('Pns', pnsSchema, 'pns');  //we use the common Schema of PNS
                PnsModel = result.model('Pns');
                result.model('Contract', contractSchema, 'contract'); //we use the common Schema of PNS
                ContractPnsModel = result.model('Contract');
                result.model('Collector', collectorSchema, 'collector'); //we use the common Schema of PNS
                CollectorPnsModel = result.model('Collector');
                result.model('Token', tokenSchema, 'token'); //we use the common Schema of PNS
                TokenPnsModel = result.model('Token');
                resolve(result);
            }
        });
    });
}


const initAllMongooseConnections = async () => {
    await Promise.all([
        initSMSMongooseConnection(),
        initPNSMongooseConnection()
    ]);
}

const Sms = () => {
    return SmsModel;
}

const Pns = () => {
    return PnsModel;
}

const ContractSms = () => {
    return ContractSmsModel;
}

const ContractPns = () => {
    return ContractPnsModel;
}

const CollectorSms = () => {
    return CollectorSmsModel;
}

const CollectorPns = () => {
    return CollectorPnsModel;
}

const TelfSms = () => {
    return TelfSmsModel;
}

const TokenPns = () => {
    return TokenPnsModel;
}

module.exports = { Sms, Pns, ContractSms, ContractPns, CollectorSms, CollectorPns, TelfSms, TokenPns, initAllMongooseConnections };