console.log('Starting app.js');

const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const notes = require('./notes.js');


console.log(_.isString(true));
console.log(_.isString('Andrew'));
var filteredArray = _.uniq(['Andrew', 1, 'Andrew', 1, 2, 3, 4, 3, 1, 'Jonh', 'Andrew']);
console.log(filteredArray);

