class Person {
    constructor (name, age, sex) {
        this._name = name;
        this._age = age
        this._sex = sex
        console.log("metodo constructor Person");
    }
    names () { return "All " + this._name + "'s";   }
         
    name ()       { return this._name;}
    age ()       { return this._age;}
    nameset (name) { this._name = name;}
    
}
module.exports = Person;