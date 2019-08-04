/*
 * DB configuration
 *
 */

"use strict";

const mongoose = require('mongoose');


mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });
// mongoose.set('useNewUrlParser', true); // see https://mongoosejs.com/docs/deprecations.html
// mongoose.set('useFindAndModify', false);   // see https://github.com/Automattic/mongoose/pull/6165
// mongoose.set('useCreateIndex', true);  // see https://mongoosejs.com/docs/deprecations.html


mongoose.connection.once('open', () => { //we check the mongodb connection
    console.log(process.env.GREEN_COLOR, "Connected to DB Server : " + process.env.MONGODB_URI);
});

mongoose.connection.on('error', (error) => {  //we need to know if connection works, particularly at the start if we didn't connect with it.
    console.log(process.env.RED_COLOR, error);
    console.log(process.env.RED_COLOR, "FATAL ERROR : failed to connect to db server : " + process.env.MONGODB_URI);
    process.exit(1);  //because platform doesn't works without Mongodb, we prefer to stop server
});


module.exports = { mongoose };