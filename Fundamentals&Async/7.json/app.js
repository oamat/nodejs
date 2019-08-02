
var obj = {
    name: 'Andrew'
};
var stringObj = JSON.stringify(obj);
console.log(typeof stringObj);
console.log(stringObj);

var personJSON = {"name": "Andrew","age": 25};
var {name}=personJSON
console.log("name of JSON var is " + name);

var personString = '{ "name":"John", "age":30, "city":"New York"}';
var person = JSON.parse(personString);
console.log(typeof person);
console.log(person);

//change content: 
person.name="Oriol";
//Add attribute: 
person.surname="Amat";
console.log(person);

const fs = require('fs');
var originalNote = {
  title: 'Some title',
  body: 'Some body'
};
var originalNoteString = JSON.stringify(originalNote);
fs.writeFileSync('notes.json', originalNoteString);

var noteString = fs.readFileSync('notes.json');
var note = JSON.parse(noteString);
console.log(typeof note);
console.log(note.title);
