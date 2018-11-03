console.log( "creamos un objeto Class Person que esta en otro js" );
var Person = require('./personClass');
var person = new Person ("Jame", "23", "male");
console.log("nombre = " + person.name() );
person.nameset("pepe");
console.log("nombre = " + person.names() );

var person2 = new Person ("Oriol","40", "male");
console.log("nombre = " + person2.name() );
console.log("nombre = " + person2.names() );