//String
var parseString = require('xml2js').parseString;
var xml = "<root>Hello xml2js!</root>"
parseString(xml, function (err, result) {
    console.dir(result);
});

//FILE
var fs = require('fs'),
xml2js = require('xml2js');
var parser = new xml2js.Parser();
fs.readFile('./proves/xml.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        console.log(result);
        //console.log(" tipeof : " + typeof res + " constructor=" + result.constructor);
        console.log(result.root.body[1]);
        console.log(result.root.name[1]);

    });
});