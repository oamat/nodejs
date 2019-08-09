/*
 * Auth for API
 *   JWT example (no base64 encoded in secret), test in jwt.io : 
 *      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.RSLawzTU4yX-XwnEZtvWipIBOTOji9LKbkuM391zjss
 * 
 *    secret : pojiaj234oi234oij234oij4jgstwsnaKSDADWWssswwwwssQRT
 *
 * data : { "alg": "HS256", "typ": "JWT"  }  
 * payload :  {   "sub": "1234567890",  "name": "John Doe",  "contract": "OTPLOWEB", "iat": 2016239022 }
 */

"use strict";

// Dependencies
const jwt = require('jsonwebtoken');
const redisUtil = require('../util/redis');
const { dateFormat } = require('../util/formats');

// method auth async, and it's necessary call function next in the end if all is correct.
const auth = async (req, res, next) => {
    try {
        if (req.body == null || req.body.contract == null || req.body.telf == null) {
            throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
        } else if (req.header('x-api-key') == null) { //check that client sends the token JWT
            throw new Error("You didn't send the JWT Token, you need to authenticate on the platform with corrrect JWT. Please authenticate before proceeding.");
        } else {
            const token = req.header('x-api-key').replace('Bearer ', '');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.contract != req.body.contract) { //check that contract in request is the same than contract in jwt
                throw new Error('Your contract does not match with JWT, you need to authenticate on the platform. Please authenticate before proceeding.');
            } else {
                await redisUtil.hgetForAuth(decoded.contract, "jwt", token); //check that contract exist in redis Conf                    
                next();
            }
        }
    } catch (error) {
        unauthoritzedError(error, req, res);
    }
}

const unauthoritzedError = (error, req, res) => {
    let contract = req.body.contract || 'undefined';
    let telf = req.body.telf || 'undefined';
    const errorJson = { StatusCode: "401 Unauthoritzed", error: error.message, contract, telf, receivedAt: dateFormat(new Date()) };   // dateFormal: replace T with a space && delete the dot and everything after
    console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
    res.status(401).send(errorJson);
}

module.exports = auth