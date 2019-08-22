/*
 * Auth for API
 *   JWT example (no base64 encoded in secret), test in jwt.io : 
 *      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6ImFkbWluIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.7UhLsjPpOwneXzN3nlT35OJjduzp70Yni9l1HO9wCck
 * 
 *    secret : pojiaj234oi234oij234oij4jgstwsnaKSDADWWssswwwwssQRT
 *
 * example :
 * data : { "alg": "HS256", "typ": "JWT"  }  
 * payload :  {   "sub": "1234567890",  "name": "admin",  "contract": "ADMIN", "iat": 2016239022 }
 */

"use strict";

// Dependencies
const jwt = require('jsonwebtoken');
const { hget } = require('../util/redis');
const { dateFormat } = require('../util/formats');

// method auth async, and it's necessary call function next in the end if all is correct.
const auth = async (req, res, next) => {
    try {
        if (!req || !req.body || !req.body.contract ) {  //first we check the body params request. 
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
        } else if (!req.header || !req.header('x-api-key')) { //check that client sends header and the token JWT
            throw new Error("You didn't send the JWT Token, you need to authenticate on the platform with corrrect JWT. Please authenticate before proceeding.");
        } else {
            const token = req.header('x-api-key').replace('Bearer ', ''); //we need token without Bearer characters.
            const decoded = jwt.verify(token, process.env.JWT_SECRET); //this method is Synchronous, so i don't need await.
            const contractToken = hget("contractfrontend:" + decoded.contract, "jwt"); //this method is Async, but we can get in parallel until need it (with await). 
            if (decoded.contract != req.body.contract) { //check that contract in request is the same than contract in jwt
                throw new Error('Your contract does not match with JWT, you need to authenticate on the platform. Please authenticate before proceeding.');
            } else {
                if (token != await contractToken) { //check that jwt was created from this server and exist in redis Conf, we need to wait the result.                         
                    throw new Error('Your JWT is invalid, you need to authenticate on the platform with correct JWT. Please authenticate before proceeding.');
                } else next(); // next() represents the next method, see router pns.
            }
        }
    } catch (error) {
        unauthoritzedError(error, req, res); // method for unauthoritzed Error responds
    }
}

const unauthoritzedError = (error, req, res) => { // method for unauthoritzed Error responds
    //TODO: personalize errors 400 or 500. 
    let contract = req.body.contract || 'undefined';

    const errorJson = { StatusCode: "401 unauthoritzed", error: error.message, contract: contract, receiveAt: dateFormat(new Date()) };   // dateFornat: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
    res.status(401).send(errorJson);
    //TODO: save error in db  or mem.
}

module.exports = auth