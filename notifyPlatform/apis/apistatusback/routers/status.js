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
const auth = require('../auth/auth');

const { updateSomeSMS } = require('../util/mongosms');
const { dateFormat, logTime } = require('../util/formats');


const router = new express.Router();


//Method post for sending SMS
router.post('/smsStatusBack', auth, async (req, res) => {  //we execute auth before this post request method
    console.log(process.env.WHITE_COLOR, logTime(new Date()) + "SMS_Status new request : " + JSON.stringify(req.body));
    try {
        //TODO :  format the operator response, maybe the staus operator is not the same that I expected: //0:notSent, 1:Sent, 2:Confirmed, 3:Error, 4:Expired   
        let status = parseInt(req.body.status);
        let operator = req.body.operator;
        let id = req.body.id;
        if (status < 2) throw new Error(" Status from Operator is not correct.");
        const toUpdate = { status, operator, id}
        await updateSomeSMS(id, toUpdate) //update Status of sms to DB.
            .catch(error => {
                error.message = "WARNING :  We cannot save notify in MongoBD. " + error.message;
                throw error;
            });

        //response 200, with sms._id. is it necessary any more params?
        let response = { statusCode: "200 OK", id, status, operator }
        res.send(response);
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "SMS Status update : " + JSON.stringify(response));  //JSON.stringify for replace new lines (\n) and tab (\t) chars into string
    } catch (error) {
        requestError(error, req, res);
        //TODO : maybe we can save  the errors in Redis
    }
});

const requestError = async (error, req, res) => {
    //TODO personalize errors 400 or 500. 
    let id = req.body.id || 'undefined';
    let status = req.body.status || 'undefined';
    let operator = req.body.operator || 'undefined';

    const errorJson = { StatusCode: "400 Bad Request", error: error.message, id, status, operator, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "WARNING: " + JSON.stringify(errorJson));
    res.status(400).send(errorJson);
    //TODO: save error in db  or mem.
}
module.exports = router