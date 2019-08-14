/*
 * redis util for notify platform. 
 *
 */

//Dependencies
const redis = require('../config/redis');

//methods 

// this method gets hash name and its property, in a generic way
const hget = async function (name, key) {
    return new Promise((resolve, reject) => {
        redis.client.hget(name, key, (error, result) => { //get the value of hash                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null) { //If we don't find the name:key.                       
                    throw new Error('Problem in the configuration [' + name + '] does not have [' + key + '] property, you need to reconfigure it before proceding.');
                } else resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; })  //return the result value of property hash contract
        .catch((error) => { throw error; }); //throw Error exception to the main code
}

// this method save smsJson in a list (like qeues MQ)
const lpush = async function (name, value) {
    return new Promise((resolve, reject) => {
        redis.client.lpush(name, value, (error, result) => { //save the value in list                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null || result == 0) { //If we cannot save the value, maybe we don't have enough memory or something like that                      
                    throw new Error('we didn\'t save value in redis list because a undefined problem, it\'s necessary check the problem before proceding.');
                } else resolve(result);
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
                    throw new Error('we didn\'t save value with redis SADD because a undefined problem, it\'s necessary check the problem before proceding.');
                } else if (result == 0) { //If we cannot save the value, maybe we don't have enough memory or something like that                      
                    console.log(process.env.YELLOW_COLOR, 'we didn\'t save value in redis SET because exists.');
                } else resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code
}


// this method save id's in a SET for checking retries or errors.
const set = async function (name, value) {
    return new Promise((resolve, reject) => {
        redis.client.set(name, value, (error, result) => { //save the value in set                  
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter               
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null) { //If we cannot save the value, maybe we don't have enough memory or something like that                      
                    throw new Error('we didn\'t save value with redis SET because a undefined problem, it\'s necessary check the problem before proceding.');
                } else resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code
}
module.exports = { hget, lpush, sadd, set }
