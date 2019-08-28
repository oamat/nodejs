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
const Pns = require('../models/pns');
const auth = require('../auth/auth');

const { savePNS } = require('../util/mongopns');
const { hget, lpush, sadd, set } = require('../util/redispns');
const { dateFormat, buildPNSChannel } = require('../util/formats');


const router = new express.Router();


//Method post for sending PNS  //status, listby user (by date), list by uuid (by date), registeruuid: app, user, osVendor, osVersion, uuidDevice, token,
router.post('/pnsSend', auth, async (req, res) => {  //we execute auth before this post request method
    console.log(process.env.WHITE_COLOR, " PNS new request : " + JSON.stringify(req.body));
    try {
        const pns = new Pns(req.body);  //await it's unnecessary because is the first creation of object. Model Validations are check when save in Mongodb, not here. 
        pns.operator = await hget("contractpns:" + pns.contract, "operator"); //Operator by default by contract. we checked the param before (in auth)       
        if (pns.operator == "ALL") { //If operator is ALL means that we need to find the better operator for the telf. 
            //TODO: find the best operator for this tef. Not implemented yet
            pns.operator = "AND";
        }
        const collectorOperator = hget("collectorpns:" + pns.operator, "operator"); //this method is Async, but we can get in parallel until need it (with await). 

        if (await collectorOperator != pns.operator) pns.operator = collectorOperator;  //check if the operator have some problems

        pns.channel = buildPNSChannel(pns.operator, pns.priority); //get the channel to put notification with operator and priority

        await pns.validate(); //we need await because is a promise and we need to manage the throw exceptions, particularly validating errors in bad request.
        //If you didn't execute "pns.validate()" we would need await because is a promise and we need to manage the throw exceptions, particularly validating errors.

        await savePNS(pns) //save pns to DB, in this phase we need save PNS to MongoDB.
            .catch(error => {
                error.message = "ERROR :  We cannot save notify in MongoBD. " + error.message;
                throw error;
            });

        // START 2 "tasks" in parallel. Even when we recollect the errors we continue the execution and return OK.    
        Promise.all([
            lpush(pns.channel, JSON.stringify(pns)).catch(error => { return error }),  //put pns to the the apropiate lists channels: PNS.AND.1, PNS.VIP.1, PNS.ORA.1, PNS.VOD.1 (1,2,3) 
            sadd("PNS.IDS.PENDING", pns._id).catch(error => { return error }),         //we save the _id in a SET, for checking the retries, errors, etc.  
        ]).then(values => {
            if (values[0] instanceof Error) { console.log(process.env.YELLOW_COLOR, " ERROR: We cannot save PNS in Redis LIST (lpush): " + values[0].message); }  //lpush returns error
            if (values[1] instanceof Error) { console.log(process.env.YELLOW_COLOR, " ERROR: We cannot save PNS in Redis SET (sadd): " + values[1].message); } //sadd returns error          
        });
        // END the 2 "tasks" in parallel    


        //response 200, with pns._id. is it necessary any more params?
        res.send({ statusCode: "200 OK", _id: pns._id });
        console.log(process.env.GREEN_COLOR, " PNS to send : " + JSON.stringify(pns));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string

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
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
    res.status(401).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router