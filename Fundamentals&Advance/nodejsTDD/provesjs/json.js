var fs = require('fs');
 
var text = '{ "employees" : [' +
'{ "firstName":"John" , "lastName":"Doe" },' +
'{ "firstName":"Anna" , "lastName":"Smith" },' +
'{ "firstName":"Peter" , "lastName":"Jones" } ]}';
 
var obj = JSON.parse(text);
 
console.log("JSON EMPLOYEES Length : " + obj.employees.length + " tipeof : " + typeof obj);
 
for (i = 0; i < obj.employees.length; i++) {
   console.log(obj.employees[i].firstName + " " + obj.employees[i].lastName);
}
 
 
var person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"};
 
console.log("\nOBJECT PERSON: " + person.firstName + " " + person.lastName + " tipeof : " + typeof person);
 
var names = ["John", "Anna", "Peter"];
 
console.log("\nARRAY NAMES length: " + names.length + " tipeof : " + typeof names);
 
for (i = 0; i < names.length; i++) {
   console.log(names[i]);
}
 
 
 var path = './proves/employees.json';
console.log("\nSTARTING READ FILE ASINCHRON...");
var data;
fs.readFile(path, 'utf8', filereadasinc);
 
// console.log("\nSTARTING READ FILE ASINCHRON...");
// var data;
// fs.readFile(path, 'utf8', (err, data) => { 
  // if (err) throw err;
  // console.log(data);
  // console.log("\n\n FINISH READ FILE ASINCHRONOUS : " + data.length + " tipeof : " + typeof obj);
// });
 
 
 
console.log("\nSTARTING READ FILE SINCHRON...");
var json = JSON.parse(fs.readFileSync(path, 'utf8'));
console.log("FINISH READ FILE SINCHRON : " + json.employees.length + " tipeof : " + typeof obj);
 
function filereadasinc(err, data) {
  if (err) throw err;
  console.log(data);
  console.log("\n\n FINISH READ FILE ASINCHRONOUS : " + data.length + " tipeof : " + typeof obj);
}
 