console.log('Starting app');
//función getUser, en variable
var getUser = (id, callback) => {
  console.log('Entering getUser function');
  // emulates data user from BBDD for example
  var user = { id: id, name: 'Vikram' };
  //callback(user);
 
  //Para ser más real:
    setTimeout(() => { callback(user); }, 300);
};

//llamamos a getUser, el callback es una función con paràmetro userObject
getUser(31, (user) => {
  console.log('Entering callback function');
  console.log(user);
});
