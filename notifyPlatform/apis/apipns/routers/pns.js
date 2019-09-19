/*
 * API REST for sending PNS notification
 *   this code only have 1 method, pnsSend:
 *          validates the request
 *          Save data in relevant redis list 
 *          Save data to mongodb
 *
 */

"use strict";

//Dependencies
const express = require('express');
const { Pns } = require('../models/pns');
const auth = require('../auth/auth');

const { savePNS } = require('../util/mongopns');
const { lpush, sadd } = require('../util/redispns');
const { hget, hgetOrNull } = require('../util/redisconf');
const { dateFormat, logTime, buildPNSChannel } = require('../util/formats');


const router = new express.Router();


//Method post for sending PNS  //status, listby user (by date), list by uuid (by date), registeruuid: app, user, osVendor, osVersion, uuidDevice, token,
router.post('/pnsSend', auth, async (req, res) => {  //we execute auth before this post request method
    //console.log(process.env.WHITE_COLOR, logTime(new Date()) + "PNS new request : " + JSON.stringify(req.body));
    try {
        const pns = new Pns(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        pns.token = await hgetOrNull("tokenpns" + pns.application + ":" + pns.uuiddevice, "token"); //find the token for this uuiddevice PNS.
        pns.operator = await hgetOrNull("tokenpns" + pns.application + ":" + pns.uuiddevice, "operator"); //find the operator for this uuiddevice PNS.
        if (!pns.token) throw new Error(" This uuiddevice is not register, we cannot find its token neither operator.") //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired, 5:token not found (not register)

        const collectorOperator = await hget("collectorpns:" + pns.operator, "operator"); //this method is Async, but we can get in parallel until need it (with await). 

        if (collectorOperator != pns.operator) pns.operator = collectorOperator;  //check if the operator have some problems

        pns.channel = buildPNSChannel(pns.operator, pns.priority); //get the channel to put notification with operator and priority

        //await sms.validate(); //validate is unnecessary, we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.
       
        await savePNS(pns) //save sms to DB, in this phase we need save SMS to MongoDB. //If you didn't execute "sms.validate()" we would need await in save.
            // .catch(error => {       // we need catch only if get 'await' out            
            //     throw error;
            // });

        // START 2 "tasks" in parallel. Even when we recollect the errors we continue the execution and return OK.    
        if (pns.token) {
            Promise.all([
                lpush(pns.channel, JSON.stringify(pns)).catch(error => { return error }),  //put pns to the the apropiate lists channels: PNS.GOO.1, PNS.VIP.1, PNS.ORA.1, PNS.VOD.1 (1,2,3) 
                sadd("PNS.IDS.PENDING", pns._id).catch(error => { return error }),         //we save the _id in a SET, for checking the retries, errors, etc.  
            ]).then(values => {
                if (values[0] instanceof Error) { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: We cannot save PNS in Redis LIST (lpush): " + values[0].message); }  //lpush returns error
                if (values[1] instanceof Error) { console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: We cannot save PNS in Redis SET (sadd): " + values[1].message); } //sadd returns error          
            });
            // END the 2 "tasks" in parallel    
        }

        //response 200, with pns._id. is it necessary any more params?
        res.send({ statusCode: "200 OK", _id: pns._id });
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "PNS saved, _id: " + pns._id);  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string

    } catch (error) {
        requestError(error, req, res);
        //TODO : maybe we can save  the errors in Redis
    }
});

const requestError = async (error, req, res) => {
    //TODO: personalize errors 400 or 500. 
    let contract = req.body.contract || 'undefined';
    let uuiddevice = req.body.uuiddevice || 'undefined';
    let content = req.body.content || 'undefined';
    let application = req.body.application || 'undefined';
    let action = req.body.action || 'undefined';

    const errorJson = { StatusCode: "400 Bad Request", error: error.message, contract: contract, uuiddevice: uuiddevice, application: application, action: action, content: content, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "ERROR: " + JSON.stringify(errorJson));
    res.status(401).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router