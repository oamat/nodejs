var Singleton = require('./singleton');
var instance1 = Singleton.getInstance();
var instance2 = Singleton.getInstance();
 
 console.log("Same instance? after initialize :" + (instance1 === instance2));  

 instance1[0]="55";
 instance2[2]="00";
 console.log("Same instance? after modify :" + (instance1 === instance2));  