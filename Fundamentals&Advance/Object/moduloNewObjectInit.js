const printIntroduction = function () {
    console.log(`My name is ${this.name}. Am I human? ${this.isHuman}`);
  }



const person1 = new Object();
person1.name = 'me';
person1.isHuman = true;
person1.printIntroduction = printIntroduction;

const person2 = new Object();
person2.name = 'you';
person2.isHuman = false;
person2.printIntroduction = printIntroduction;

person1.printIntroduction();
person2.printIntroduction();