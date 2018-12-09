var Person = require('./personClass');
class PersonExt extends Person{
    nameSpecial () { return "All Special " + this._name + "'s";   }
}
module.exports = PersonExt;