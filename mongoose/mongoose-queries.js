const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

var id_todos = '5bf0976932c0350d04930421';
var id_user = "5bf084bce2b1212300d72d6b"


if (!ObjectID.isValid(id_todos)) {
  console.log('ID Todos not valid');
}


Todo.find({
  _id: id_todos
}).then((todos) => {
  console.log('Todos', todos);
});

Todo.findOne({
  _id: id_todos
}).then((todo) => {
  console.log('Todo', todo);
});

Todo.findById(id_todos).then((todo) => {
  if (!todo) {
    return console.log('Id not found');
  }
  console.log('Todo By Id', todo);
}).catch((e) => console.log(e));



if (!ObjectID.isValid(id_user)) {
  console.log('ID User not valid');
}


User.findById(id_user).then((user) => {
  if (!user) {
    return console.log('Unable to find user');
  }

  console.log(JSON.stringify(user, undefined, 2));
}, (e) => {
  console.log(e);
});
