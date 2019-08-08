/*
 * API REST for sending SMS notification
 *   this code only have 1 method, smsSend:
 *          validates the request
 *          Save data in relevant redis list 
 *          Save data to mongodb
 *
 */

"use strict";

const express = require('express');
const Sms = require('../models/sms');
const auth = require('../auth/auth');
const redis = require('../config/redis');
const { dateFormat } = require('../util/formats');

const router = new express.Router();

router.post('/smsSend', auth, async (req, res) => {

    try {

        //TODO create JSON sms object with unique UUID ,     //you can see 3console.log( req.body );
        const sms = new Sms(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        await sms.validate(); //we need await because is a promise and we need to manage the throw exceptions, particularly validating errors.

        redis.client.hget("contract:" + sms.contract, "channel", (error, channel) => { //check the channel to put notification                   
            try {  //I need to use try/catch in async callback or we can use EventEmitter or Promise.all
                if (error != null) { //if redis give me an error.                           
                    throw new Error(error.message);
                } else if (channel == null) { //If we don't find the contract:key.                       
                    throw new Error('Your contract does not have channel, you need to reconfigure it before proceding.');
                } else {
                    //put message in Redis in the appropiate list: SMS.MOV.1, SMS.VIP.1, SMS.ORA.1, SMS.VOD.1 (1,2,3) 
                    redis.client.rpush(channel, JSON.stringify(sms));
                    //save sms to DB
                    sms.save();  //If you didn't execute "sms.validate()" we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors.

                    //TODO return sms._id
                    res.send({ statusCode: "200 OK", _id: sms._id });
                    console.log(process.env.GREEN_COLOR, " SMS to send : " + JSON.stringify(sms));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string

                }
            } catch (error) {
                requestError(error, req, res);
            }
        });

    } catch (error) {
        requestError(error, req, res);
    }
});

const requestError = (error, req, res) => {
    //TODO personalize errors 400 or 500.         
    const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: req.body.contract, telf: req.body.telf, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router