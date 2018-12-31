// see config.json for all configurations X enviroment

var env = process.env.NODE_ENV || 'development';
var config = require('./config.json');
var configXenviroment;
if (env === 'development') {  // For dev enviroment, see config.json  

  configXenviroment = config[env];
  Object.keys(configXenviroment).forEach((key) => {
    process.env[key] = configXenviroment[key];
  });
} else {  //For other enviroments
  if (config[env] == null) env = 'docker'; // For docker enviroment, see config.json
  configXenviroment = config[env];  // For docker enviroment, see config.json
  Object.keys(configXenviroment).forEach((key) => {
    process.env[key] = configXenviroment[key];
  });
}
console.log(process.env.MONGODB_URI);
