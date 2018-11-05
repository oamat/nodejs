var somePromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    //logic code, BBDD acces for example
    resolve('Hey. It worked!');    
  }, 500);
});

var somePromiseErr = new Promise((resolve, reject) => {
  setTimeout(() => {
    //logic code, BBDD acces for example
    reject('Unable to connect to BBDD');
  }, 300);
});

console.log("First Promise call");
somePromise.then((object) => {
  console.log('Success: ', object);
}, (error) => {
  console.log('Error: ', error);
});

console.log("Second Promise call");
somePromiseErr.then( (object) => {
  console.log('First Success: ', object);
}, (error) => {
  console.log('Second Error: ', error);
});