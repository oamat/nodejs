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
const redisUtil = require('../util/redis');
const { dateFormat } = require('../util/formats');

const router = new express.Router();

//Method post for sending SMS
router.post('/smsSend', auth, async (req, res) => {

    try {

        //TODO create JSON sms object with unique UUID ,     //you can see 3console.log( req.body );
        const sms = new Sms(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
                
        sms.channel = await redisUtil.hget(sms.contract, "channel"); //get the channel to put notification 
        //TODO: the channel option that depends on Operators (when channel is "owner"), require telf in redis with better operator

        await sms.validate(); //we need await because is a promise and we need to manage the throw exceptions, particularly validating errors.
        
        //Async: put message in Redis in the appropiate list (like qeues MQ), return the index list but it's unnecessary.
        redisUtil.rpush(sms.channel, JSON.stringify(sms));   // the lists channels: SMS.MOV.1, SMS.VIP.1, SMS.ORA.1, SMS.VOD.1 (1,2,3) 
        redisUtil.sadd("smsids", sms._id); // we save the _id in a SET, for checking the retries, errors, etc.  
    
        //Async: save sms to DB, 
        sms.save();  //If you didn't execute "sms.validate()" we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors.

        //response 200, with sms._id. is it necessary any more params?
        res.send({ statusCode: "200 OK", _id: sms._id });
        console.log(process.env.GREEN_COLOR, " SMS to send : " + JSON.stringify(sms));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string

    } catch (error) {
        requestError(error, req, res);
        //TODO : maybe we can save  the errors in Redis
    }
});

const requestError = (error, req, res) => {
    //TODO personalize errors 400 or 500. 
    let contract = req.body.contract || 'undefined';
    let telf = req.body.telf || 'undefined';        
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: contract, telf: telf, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router