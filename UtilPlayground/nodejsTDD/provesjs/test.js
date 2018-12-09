var assert = require('assert');
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});

var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai
var PersonExt = require('./personExtends');
describe('PersonImpl test', function() {
  it('name function should return Oriol if I use constructor initialitation', function() {
    var person = new PersonExt ("Oriol", "23", "male");
    expect(person.name()).to.equal("Oriol");
 });
});

var assert = chai.assert;// we are using the "assert" style of Chai
describe('Person Object With Assert', function() {
  it('name function should return Oriol if I use constructor initialitation', function() {
    var person = new PersonExt ("Xavier", "44", "male");
    assert.equal(person.name(), "Xavier");
 });
});

var assert = chai.assert;// we are using the "assert" style of Chai
describe('PersonImpl Object With Assert', function() {
  it('name function should return Xavier Special', function() {
    var person = new PersonExt ("Xavier", "44", "male");
    assert.equal(person.nameSpecial(), "All Special Xavier's");
 });
});