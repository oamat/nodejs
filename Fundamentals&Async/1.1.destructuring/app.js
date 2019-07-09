//Shorthand & Destructuring y sintaxis abreviada

//Shorthand 
const name = "Oriol";
const age = "25";

const user = { 
    name, 
    age,
    location : 'Barcelona',
    department :  'architecture'
}
console.log('JSON user : ' + JSON.stringify(user));
//Destructuring 

var {location, department} =  user; 
console.log( "location_var : " + location + " /   department_var : " + department)


//Sintaxis abreviada
var obj = {
    a : "a",
    ["b"+1] : "b",  //creamos key al vuelo
    product(){ return "Product A"; }, //creamos key con función, return es value
    foo() { return (this.product + " & foo") } , //creamos key con función, return es value
    bar() { return (this.foo + " & bar") },  //creamos key con función, return es value
    [ "product+"+"foo+"+"bar"]() { return (this.product+this.foo+this.bar)} //creamos key con función al vuelo, y return es value
}
console.log('JSON obj : ' + JSON.stringify(obj));