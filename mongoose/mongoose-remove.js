const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');



var id ='5bf0976932c0350d04930421';

//remove 1 reg
Todo.findByIdAndDelete(id).then((todo) => {
  console.log(todo);
});

//remove all regs
Todo.deleteMany({}).then((result) => {
  console.log(result);
});
