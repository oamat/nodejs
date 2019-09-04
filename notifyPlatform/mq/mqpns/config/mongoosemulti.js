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

const options = { //options for connection to MongoDB
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    poolSize: 5,
    dbName: "notifyplatform",
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE
};

//For MongoDB SMS 
var dbSMS = mongoose.createConnection(process.env.MONGODBSMS_URI, options);  //create connection
console.log(process.env.GREEN_COLOR, "Connected to SMS MongoDB Server : " + process.env.MONGODBPNS_URI);
dbSMS.model('Sms', smsSchema, 'sms'); //we use the common Schema of PNS
var Sms = dbSMS.model('Sms');
dbSMS.model('Contract', contractSchema, 'contract'); //we use the common Schema of PNS
var ContractSms = dbSMS.model('Contract');


//For MongoDB PNS
var dbPNS = mongoose.createConnection(process.env.MONGODBPNS_URI, options);  //create connection
console.log(process.env.GREEN_COLOR, "Connected to PNS MongoDB Server : " + process.env.MONGODBPNS_URI);
dbPNS.model('Pns', pnsSchema, 'pns');  //we use the common Schema of PNS
var Pns = dbPNS.model('Pns');
dbPNS.model('Contract', contractSchema, 'contract'); //we use the common Schema of PNS
var ContractPns = dbPNS.model('Contract');

module.exports = { Sms, Pns, ContractSms, ContractPns };