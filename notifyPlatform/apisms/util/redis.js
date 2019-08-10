/*
 * redis util for notify platform. 
 *
 */

//Dependencies
const redis = require('../config/redis');

//methods 

// this method gets hash contract and its property, special for authoritation
const hgetForAuth = async function (contract, key, token) {
    return new Promise((resolve, reject) => {
        redis.client.hget("contract:" + contract, key, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw new Error(error.message);
                } else if (result == null) { //If we don't find the contract:key.                       
                    throw new Error('Your contract is invalid, you need to authenticate on the platform with correct contract. Please authenticate before proceeding.');
                } else if (result != token) { //check that jwt was created from this server and exist in redis Conf                         
                    throw new Error('Your JWT is invalid, you need to authenticate on the platform with correct JWT. Please authenticate before proceeding.');
                }
                resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; }) //return the result value of property hash contract
        .catch((error) => { throw error; }); //throw Error exception to the main code
}

// this method gets hash contract and its property, in a generic way
const hget = async function (contract, key) {
    return new Promise((resolve, reject) => {
        redis.client.hget("contract:" + contract, key, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null) { //If we don't find the contract:key.                       
                    throw new Error('Your contract does not have ' + key + ', you need to reconfigure it before proceding.');
                }
                resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; })  //return the result value of property hash contract
        .catch((error) => { throw error; }); //throw Error exception to the main code
}

// this method save smsJson in a list (like qeues MQ)
const rpush = async function (name, value) {
    return new Promise((resolve, reject) => {
        redis.client.rpush(name, value, (error, result) => { //save the value in list                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null || result == 0) { //If we cannot save the value, maybe we don't have enough memory or something like that                      
                    throw new Error('we didn\'t save value in redis list because a undefined problem, it\'s necessary check the problem before proceding.');
                }
                resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; }) //return the result number
        .catch((error) => { throw error; }); //throw Error exception to the main code
}

// this method save id's in a SET for checking retries or errors.
const sadd = async function (name, value) {
    return new Promise((resolve, reject) => {
        redis.client.sadd(name, value, (error, result) => { //save the value in set                  
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null) { //If we cannot save the value, maybe we don't have enough memory or something like that                      
                    throw new Error('we didn\'t save value in redis SET because a undefined problem, it\'s necessary check the problem before proceding.');
                } else if (result == 0) { //If we cannot save the value, maybe we don't have enough memory or something like that                      
                    console.log(process.env.YELLOW_COLOR, 'we didn\'t save value in redis SET because exists.');
                }
                resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code
}
module.exports = { hget, rpush, sadd, hgetForAuth }
