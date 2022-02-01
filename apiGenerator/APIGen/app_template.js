const Handlebars = require("handlebars");
var fs = require('fs');


// example names: 
//{{name_low}} = gamesystems
//{{name_1upper}} = Gamesystem
//{{name_1upper_plural}} = Gamesystems
//{{name_upper}} = GAMESYSTEM


const file = fs.readFileSync('./templates/nodejs_express/test1.hbs', 'utf8');
//console.log(file);


const template = Handlebars.compile(file);

var output = template({ name_low: "user", name_1upper: "User", name_1upper_plural: "Users", name_upper: "USER" });
//console.log(output);



fs.writeFile('./api_generated/user.js', output, function (err) {
    if (err) return console.log(err);
    console.log('generated template > ./api_generated/user.js');
  });
