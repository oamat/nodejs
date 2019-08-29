/*
 * DB configuration
 *
 */

"use strict";

// Dependencies
const mongoose = require('mongoose');
const options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    poolSize: 5,
    dbName: "notifyplatform",
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE
};
// Init mongoose
mongoose.Promise = global.Promise;


// EventEmitter in case of Errors, stop all process
mongoose.connection.once('open', () => { //we check the mongodb connection
    console.log(process.env.GREEN_COLOR, "Connected to SMS MongoDB Server : " + process.env.MONGODBSMS_URI);
});

mongoose.connection.on('error', (error) => {  //we need to know if connection works, particularly at the start if we didn't connect with it.
    //console.log(process.env.RED_COLOR, error);
    //console.log(process.env.RED_COLOR, "MONGODB ERROR : failed to connect to db server : " + process.env.MONGODBSMS_URI + " . " + error.message);
    //process.exit(1);  //because platform doesn't works without Mongodb, we prefer to stop server
    console.log(process.env.RED_COLOR, "MONGODB SMS ERROR : failed to connect to SMS mongodb server : " + process.env.MONGODBSMS_URI);
    console.log(process.env.YELLOW_COLOR, "MONGODB SMS ERROR : we will try to connect to SMS mongodb in 15s...");
    setTimeout(function () {
        initializeMongooseConnection();
    }, 15000);
});

const initializeMongooseConnection = async () => {
    
    try {
        await mongoose.connect(process.env.MONGODBSMS_URI, options); // await connection to DB
        // mongoose.set('useNewUrlParser', true); // see https://mongoosejs.com/docs/deprecations.html
        // mongoose.set('useFindAndModify', false);   // see https://github.com/Automattic/mongoose/pull/6165
        // mongoose.set('useCreateIndex', true);  // see https://mongoosejs.com/docs/deprecations.html
    } catch (error) {
        console.error(process.env.RED_COLOR, error.message);
    }
}

module.exports = { initializeMongooseConnection, mongoose };