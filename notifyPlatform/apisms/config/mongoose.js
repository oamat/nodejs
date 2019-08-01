/*
 * DB configuration
 *
 */

"use strict";

var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true , useFindAndModify: false , useCreateIndex: true  });
//mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true });
mongoose.set('useNewUrlParser', true); // see https://mongoosejs.com/docs/deprecations.html
mongoose.set('useFindAndModify', false);   // see https://github.com/Automattic/mongoose/pull/6165
mongoose.set('useCreateIndex', true);  // see https://mongoosejs.com/docs/deprecations.html

module.exports = {mongoose};