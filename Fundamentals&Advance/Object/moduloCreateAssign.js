
const printIntroduction = function () {
  console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
}


const person = {
  isHuman: false,
  name: "NotInitialized",
  printIntroduction
};

const me = Object.create(person);
const you = Object.create(person);
const they = Object.assign({}, person);

me.printIntroduction();
you.printIntroduction();
they.printIntroduction();

me.name = 'me'; // "name" is a property set on "me", but not on "person"
me.isHuman = true; // Inherited properties can be overwritten

me.printIntroduction();
// Expected output: "My name is Matthew. Am I human? true"
you.printIntroduction();
they.printIntroduction();

you.name = 'you'; // "name" is a property set on "me", but not on "person"
you.isHuman = false; // Inherited properties can be overwritten

you.printIntroduction();
me.printIntroduction();
they.printIntroduction();

they.name = 'they';
they.isHuman = true;

you.printIntroduction();
me.printIntroduction();
they.printIntroduction();
console.log(they);
