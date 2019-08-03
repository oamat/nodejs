/*
 * DB configuration
 *
 */

"use strict";

const mongoose = require('mongoose');

try {
    mongoose.Promise = global.Promise;    
    mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true }).catch(error => { throw (error); })
    mongoose.set('useNewUrlParser', true); // see https://mongoosejs.com/docs/deprecations.html
    mongoose.set('useFindAndModify', false);   // see https://github.com/Automattic/mongoose/pull/6165
    mongoose.set('useCreateIndex', true);  // see https://mongoosejs.com/docs/deprecations.html
} catch (error) {
    console.log(process.env.RED_COLOR, error);
    process.exit(1);  // we stop express process when we no have connection to db
}

mongoose.connection.on('error', () => {  //we need to know if connection works, particularly at the start if we didn't connect with it.
    console.error.bind(console, 'connection error:');
    console.log(process.env.RED_COLOR, "failed to connect to db server : " + process.env.MONGODB_URI);
    process.exit(1);
});
mongoose.connection.once('open', () => { console.log(process.env.MAGENTA_COLOR, "Connected to DB  : " + process.env.MONGODB_URI); });

module.exports = { mongoose };