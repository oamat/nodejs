
const user = require('./users');

console.log("create users: 1,2,3 ");

 const user1 = user.addUser({ id: 1, username : "user1" , room :"room1"  });
 const user2 = user.addUser({ id: 2, username : "user2" , room :"room1"  });
 const user3 = user.addUser({ id: 3, username : "user3" , room :"room1"  });


 console.log("***************************");
 console.log("********getUsersInRoom*****");
 console.log(user.getUsersInRoom("room1"));
 
 console.log("***************************");
 console.log("********getUser*****");
 console.log(user.getUser(2));  
 
 console.log("***************************");
 console.log("********removeUser*****");
 console.log(user.removeUser(2));
 
 console.log("***************************");
 console.log("********getUsersInRoom*****");
 console.log(user.getUsersInRoom("room1"));

 

