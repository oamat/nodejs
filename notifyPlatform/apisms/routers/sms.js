/*
 * API SMS
 *
 */

"use strict";

const express = require('express');
const Sms = require('../models/sms');
const auth = require('../auth/auth');
const { dateFormat } = require('../util/formats');
const redis = require('../config/redis');


const router = new express.Router();

router.post('/smsSend', auth, async (req, res) => {
    try {

        //console.log( req.body );

        //TODO create JSON sms object with unique UUID 
        const sms = new Sms(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        await sms.validate(); //we need await because is a promise and we need to manage the throw exceptions, particularly validating errors.

        //TODO put message in Redis in the appropiate list
        redis.client.rpush("SMS_MOVISTAR_ALTA", JSON.stringify(sms)); //Insert sms at the tail of the list
        
        //TODO save sms to DB
        sms.save();  //If you didn't execute "sms.validate()" we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors.



        //TODO return sms._id
        res.send({ statusCode: "200 OK", _id: sms._id });
        console.log(process.env.GREEN_COLOR, " SMS to send : " + JSON.stringify(sms));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string


    } catch (error) {
        //TODO personalize errors 400 or 500. 
        const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: req.body.contract, telf: req.body.telf, receiveAt: dateFormat(new Date()) };   // replace T with a space && delete the dot and everything after
        console.log(process.env.RED_COLOR, "ERROR: " + JSON.stringify(errorJson));        
        res.status(400).send(errorJson);
        //TODO: save error in db  or mem.
    }

});

// GET /smsStatus   # uuid in body
router.get('/smsStatus', auth, async (req, res) => {
    console.log(req.body);
    //TODO find sms by id
    //TODO return Status
    res.send({ Status: "200 OK" });
});

// GET /smsByTelf  # telf, dates in body
router.get('/smsByTelf', auth, async (req, res) => {
    console.log(req.body);
    //TODO find sms's by telf and between dates
    //TODO return SMS's Status
    res.send({ Status: "200 OK" });
});

// GET /smsByContract  # contract, dates in body
router.get('/smsByContract', auth, async (req, res) => {
    console.log(req.body);

    //TODO find sms's by contract and between dates
    //TODO return list with SMS's Status
    res.send({ Status: "200 OK" });
});

// GET /smsInMem  # contract in body
router.get('/smsPending', auth, async (req, res) => {
    console.log(req.body);

    //TODO find sms's in redis and return them
    //TODO return list with SMS's
    res.send({ Status: "200 OK" });
});




module.exports = router