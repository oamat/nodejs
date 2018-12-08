var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
//mongoose.connect("mongodb://localhost:27017/test", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);   // see https://github.com/Automattic/mongoose/pull/6165
module.exports = {mongoose};
