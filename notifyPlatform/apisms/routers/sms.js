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
const { hget, lpush, sadd, set } = require('../util/redis');
const { dateFormat, buildChannel } = require('../util/formats');

const router = new express.Router();

//Method post for sending SMS
router.post('/smsSend', auth, async (req, res) => {

    try {

        //TODO create JSON sms object with unique UUID ,     //you can see 3console.log( req.body );
        const sms = new Sms(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        sms.operator = await hget("contract:" + sms.contract, "operator"); //Operator by default by contract
        if (sms.operator == "ALL") { //If operator is ALL means that we need to find the better operato for the telf. 
            //TODO: find the best operator for this tef. 
            sms.operator = "MOV";
        }

        var collectorOperator = await hget("collector:" + sms.operator, "operator"); //check if the operator have some problems
        if (collectorOperator != sms.operator) sms.operator = collectorOperator;
        sms.channel = buildChannel(sms.operator, sms.priority); //get the channel to put notification 

        await sms.validate(); //we need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.
        //If you didn't execute "sms.validate()" we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors.
       
        // START 3 "tasks" in parallel and wait for all of them to complete. Because the validate is OK.     
        await Promise.all([
            lpush(sms.channel, JSON.stringify(sms)),  //put sms to the the apropiate lists channels: SMS.MOV.1, SMS.VIP.1, SMS.ORA.1, SMS.VOD.1 (1,2,3) 
            sadd("SMS.IDS.PENDING", sms._id),         //we save the _id in a SET, for checking the retries, errors, etc.  
            sms.save()                                //save sms to DB, 
        ]);
        // END the 3 "tasks" in parallel and wait for all of them to complete    

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
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: contract, telf: telf, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router