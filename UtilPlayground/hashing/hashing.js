const bcrypt = require('bcryptjs')

var password = '123abc!';
var hashedPassword;


var hashPromise = new Promise((resolve, reject) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {      
      console.log(" hashed Password  = " + hash);
      resolve(hash); 
      // In normal way we need to save the hash into BBDD
    });
  });
});




// now we can compare the hash that we saved into BBDD with password entered for user: 
hashPromise.then((hash) => {
  bcrypt.compare(password, hash, (error, result) => {
    console.log( "bcrypt.compare : is the password correct? "  + result);
  });
}, (error) => {
  console.log('error : ', error);
});



