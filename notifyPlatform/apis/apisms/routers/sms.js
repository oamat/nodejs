/*
 * API REST for sending SMS notification
 *   this code only have 1 method, smsSend:
 *          validates the request
 *          Save data in relevant redis list 
 *          Save data to mongodb
 *
 */

"use strict";

//Dependencies
const express = require('express');
const { Sms } = require('../models/sms');
const auth = require('../auth/auth');
const { saveSMS } = require('../util/mongosms');
const { rclient } = require('../config/redissms');
const { hgetConf, hget } = require('../util/redisconf');
const { dateFormat, logTime, buildSMSChannel } = require('../util/formats');

const router = new express.Router();

//VARS
const SMS_IDS = "SMS.IDS.PENDING";


//Method post for sending SMS
router.post('/smsSend', auth, async (req, res) => {  //we execute auth before this post request method
    //console.log(process.env.WHITE_COLOR, logTime(new Date()) + "SMS new request : " + JSON.stringify(req.body));
    try {
        const sms = new Sms(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        sms.operator = await hgetConf("contractsms:" + sms.contract, "operator"); //Operator by default by contract. we checked the param before (in auth)                 
        sms.telf = sms.telf.replace("+", "00");
        if (sms.operator == "ALL") { //If operator is 'ALL' means that we need to find the better operator for the telf.            
            sms.operator = await hget("telfsms:" + sms.telf, "operator"); //find the best operator for this tef.         
            if (!sms.operator) sms.operator = "MOV";  //by default we use MOV
        }
        const collectorOperator = await hgetConf("collectorsms:" + sms.operator, "operator"); //this method is Async, but we can get in parallel until need it (with await).
        if (collectorOperator != sms.operator) sms.operator = collectorOperator;  //check if the operator have some problems and need contingency

        sms.channel = buildSMSChannel(sms.operator, sms.priority); //get the channel to put notification with operator and priority

        //await sms.validate(); //validate is unnecessary, we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.

        saveSMS(sms) //save sms to DB, in this phase we need save SMS to MongoDB. //If you didn't execute "sms.validate()" we would need await in save.
            .catch(error => {     // we need catch only if get 'await' out          
                throw error;
            })
            .then(sms => {  //save method returns sms that has been save to MongoDB

                res.send({ statusCode: "200 OK", _id: sms._id }); //ALL OK, response 200, with sms._id. TODO: is it necessary any more params?

                //START Redis Transaction with multi chain and result's callback
                rclient.multi([
                    ["lpush", sms.channel, JSON.stringify(sms)],    //Trans 1
                    ["sadd", SMS_IDS, sms._id]                      //Trans 2             
                ]).exec(function (error, replies) { // drains multi queue and runs atomically                    
                    if (error) {
                        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: We couldn't save SMS in Redis (We will have to wait for retry): " + error.message);
                    }
                });
                //END Redis Transaction with multi chain and result's callback
                
                console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS saved, _id: " + sms._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
            });

    } catch (error) {
        requestError(error, req, res);
        //TODO : maybe we can save  the errors in Redis
    }
});

const requestError = async (error, req, res) => {
    //TODO personalize errors 400 or 500. 
    let contract = req.body.contract || 'undefined';
    let telf = req.body.telf || 'undefined';
    let message = req.body.message || 'undefined';

    const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: contract, telf: telf, message: message, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router