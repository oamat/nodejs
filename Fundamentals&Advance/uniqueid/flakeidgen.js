var FlakeId = require('flake-idgen');
var intformat = require('biguint-format');
var flakeIdGen = new FlakeId();


const i =0; 
var j = 0;
while (i==0) {
    console.log ("generating flakeIdGen number " + j++ + " : " + intformat(flakeIdGen.next(), 'dec') );
}