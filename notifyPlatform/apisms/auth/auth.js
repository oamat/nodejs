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

const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const EventEmitter = require('events');
const { dateFormat } = require('../util/formats');

const auth = async (req, res, next) => {
    try {
        var myEvent = new EventEmitter();
        const token = req.header('x-api-key').replace('Bearer ', '');
        if (token !== null && token.length > 100) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.contract != req.body.contract) { //check that contract in request is the same than contract in jwt
                throw new Error('Your contract does not match with JWT, you need to authenticate on the platform. Please authenticate before proceeding.');
            } else {
                myEvent = redis.client.hget("contract:" + decoded.contract, "jwt", (error, result) => { //check that contract exist in redis Conf                    
                    console.log("redis.client.hget : " + result + error);
                    if (error != null) {
                        return new EventEmitter().emit('error', new Error(error.message));;
                    }
                    if (result + "1" != token) { //check that jwt was created from this server and exist in redis Conf              
                        return (new EventEmitter().emit('error', new Error('Your JWT is invalid, you need to authenticate on the platform with corrrect JWT. Please authenticate before proceeding.')));
                    }
                });
            }
        }

        myEvent.on('error', (error) => {
            console.log(process.env.GREEN_COLOR, " throw Error");
            throw new Error(error);
        });

        next();
    } catch (error) {
        const errorJson = { StatusCode: "401 Unauthoritzed", error: error.message, contract: req.body.contract, telf: req.body.telf, receiveAt: dateFormat(new Date()) };   // dateFormal: replace T with a space && delete the dot and everything after
        console.log(process.env.YELLOW_COLOR, "ERROR: " + JSON.stringify(errorJson));
        res.status(401).send(errorJson);
    }
}

module.exports = auth