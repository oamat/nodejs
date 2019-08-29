/*
 * Auth for API
 *   JWT example (no base64 encoded in secret), test in jwt.io : 
 *      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicmVmcmVxIjoiYXBpX3N0YXR1c19iYWNrX3JlZmVyZW5jZV9yZXF1ZXN0IiwiaWF0IjoyMDE2MjM5MDIyfQ.DQnNzRvVh970YWrZ4dnkd587rrA7AjY4cd09DwTwA34
 * 
 *    secret : pojiaj234oi234oij234oij4jgstwsnaKSDADWWssswwwwssQRT
 *
 * data : { "alg": "HS256", "typ": "JWT"  }  
 * payload :  {   "sub": "1234567890",  "name": "John Doe",  "refreq": "api_status_back_reference_request", "iat": 2016239022 }
 */

"use strict";

// Dependencies
const jwt = require('jsonwebtoken');
const { hget } = require('../util/redissms');
const { dateFormat } = require('../util/formats');

// method auth async, and it's necessary call function next in the end if all is correct.
const auth = async (req, res, next) => {
    try {
        if (!req || !req.body || !req.body.id || !req.body.status || !req.body.operator) {  //first we check the body params request. 
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
        } else if (!req.header || !req.header('x-api-key')) { //check that client sends header and the token JWT
            throw new Error("You didn't send the JWT Token, you need to authenticate on the platform with corrrect JWT. Please authenticate before proceeding.");
        } else {
            const token = req.header('x-api-key').replace('Bearer ', ''); //we need token without Bearer characters.
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //this method is Synchronous, so i don't need await.

            if (decoded.refreq != "api_status_back_reference_request") { //check that request is sigend with correct JWT
                throw new Error('Your contract does not match with JWT, you need to authenticate on the platform. Please authenticate before proceeding.');
            } else next(); // next() represents the next method, see router sms.
        }
    } catch (error) {
        unauthoritzedError(error, req, res); // method for unauthoritzed Error responds
    }
}

const unauthoritzedError = (error, req, res) => { // method for unauthoritzed Error responds
    //TODO: personalize errors 400 or 500. 
    let id = req.body.id || 'undefined';
    let status = req.body.status || 'undefined';
    let operator = req.body.operator || 'undefined';

    const errorJson = { StatusCode: "401 unauthoritzed", error: error.message, id, status, operator, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
    res.status(401).send(errorJson);
    //TODO: save error in db  or mem.
}

module.exports = auth