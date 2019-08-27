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
const { hget } = require('../util/redis');

// method auth async, and it's necessary call function next in the end if all is correct.
const auth = async (contract, token) => {
    if (!contract || !token) {  //first we check the body params request. 
        throw new Error("You didn't send the necessary params in the body of the request. You need to send the correct params before proceeding.");
    } else {       
        const decoded = jwt.verify(token, process.env.JWT_SECRET); //this method is Synchronous, so i don't need await.
        const contractToken = hget("contract:" + decoded.contract, "jwt"); //this method is Async, but we can get in parallel until need it (with await). 
        if (decoded.contract != contract) { //check that contract in request is the same than contract in jwt
            throw new Error('Your contract does not match with JWT, you need to authenticate on the platform. Please authenticate before proceeding.');
        } else {
            if (token != await contractToken) { //check that jwt was created from this server and exist in redis Conf, we need to wait the result.                         
                throw new Error('Your JWT is invalid, you need to authenticate on the platform with correct JWT. Please authenticate before proceeding.');
            }
        }
    }
}

module.exports = auth