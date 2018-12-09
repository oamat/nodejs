var chai = require('chai');
var assert = chai.assert;// we are using the "assert" style of Chai
var PersonExt = require('./personExtends');
describe('Test_prove: PersonImpl Object With Assert', function() {
  it('Test_prove: name function should return Xavier Special', function() {
    var person = new PersonExt ("Xavier", "44", "male");
    assert.equal(person.nameSpecial(), "All Special Xavier's");
    assert.isString (person.nameSpecial());
 });
});