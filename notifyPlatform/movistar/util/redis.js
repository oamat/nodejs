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
                } else if (result == null) { //If we don't find the hash name:key.                       
                    throw new Error('Your hash:' + name + ' does not have property:' + key + ', you need to reconfigure it before proceding.');
                } else resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; })  //return the result value of property hash name:key
        .catch((error) => { throw error; }); //throw Error exception to the main code
}

// this method put 1 message to other list
const rpoplpush = async function (source, destination) {
    return new Promise((resolve, reject) => {
        redis.client.rpoplpush(source, destination, (error, result) => { //save the value in list                   
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null) { //If we cannot save the value, maybe we don't have enough memory or something like that                      
                    throw new Error('we didn\'t save value in redis list because a undefined problem, it\'s necessary check the problem before proceding.');
                } else resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; }) //return the result number
        .catch((error) => { throw error; }); //throw Error exception to the main code
}

// this method delete a message list.
const rpop = async function (name) {
    return new Promise((resolve, reject) => {
        redis.client.rpop(name, (error, result) => { //save the value in set                  
            try {  //I use Promises but I need to use try/catch in async callback or I could use EventEmitter 
                if (error != null) { //if redis give me an error.                           
                    console.error(error);
                    throw error;
                } else if (result == null) { //it doesn't exist values in the list.                      
                    console.log(process.env.YELLOW_COLOR, "we didn't delete value because doesn't exist values in the list");
                } else resolve(result);
            } catch (error) { reject(error); } // In Callback we need to reject if we have Error.
        });
    })
        .then((result) => { return result; })  //return the result number
        .catch((error) => { throw error; });  //throw Error exception to the main code
}
module.exports = { hget, rpop, rpoplpush }
