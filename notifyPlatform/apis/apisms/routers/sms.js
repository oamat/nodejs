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
const Sms = require('../models/sms');
const auth = require('../auth/auth');

const { saveSMS } = require('../util/mongosms');
const { hget, lpush, sadd, set } = require('../util/redissms');
const { dateFormat, buildSMSChannel } = require('../util/formats');


const router = new express.Router();


//Method post for sending SMS
router.post('/smsSend', auth, async (req, res) => {  //we execute auth before this post request method
    console.log(process.env.WHITE_COLOR, " SMS new request : " + JSON.stringify(req.body));
    try {
        const sms = new Sms(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        sms.operator = await hget("contract:" + sms.contract, "operator"); //Operator by default by contract. we checked the param before (in auth)         
        if (sms.operator == "ALL") { //If operator is ALL means that we need to find the better operator for the telf. 
            //TODO: find the best operator for this tef. Not implemented yet
            sms.operator = "MOV";
        }
        const collectorOperator = hget("collector:" + sms.operator, "operator"); //this method is Async, but we can get in parallel until need it (with await).
        if (await collectorOperator != sms.operator) sms.operator = collectorOperator;  //check if the operator have some problems

        sms.channel = buildSMSChannel(sms.operator, sms.priority); //get the channel to put notification with operator and priority

        await sms.validate(); //we need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.
        //If you didn't execute "sms.validate()" we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors.

        await saveSMS(sms) //save sms to DB, in this phase we need save SMS to MongoDB.
            .catch(error => {
                error.message = "ERROR :  We cannot save notify in MongoBD. " + error.message;
                throw error;
            });

        // START 2 "tasks" in parallel. Even when we recollect the errors we continue the execution and return OK.    
        Promise.all([
            lpush(sms.channel, JSON.stringify(sms)).catch(error => { return error }),  //put sms to the the apropiate lists channels: SMS.MOV.1, SMS.VIP.1, SMS.ORA.1, SMS.VOD.1 (1,2,3) 
            sadd("SMS.IDS.PENDING", sms._id).catch(error => { return error }),         //we save the _id in a SET, for checking the retries, errors, etc.  
        ]).then(values => {
            if (values[0] instanceof Error) { console.log(process.env.YELLOW_COLOR, " ERROR: We cannot save SMS in Redis LIST (lpush): " + values[0].message); }  //lpush returns error
            if (values[1] instanceof Error) { console.log(process.env.YELLOW_COLOR, " ERROR: We cannot save SMS in Redis SET (sadd): " + values[1].message); } //sadd returns error          
        });
        // END the 2 "tasks" in parallel    


        //response 200, with sms._id. is it necessary any more params?
        res.send({ statusCode: "200 OK", _id: sms._id });
        console.log(process.env.GREEN_COLOR, " SMS to send : " + JSON.stringify(sms));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string

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
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router