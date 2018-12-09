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
somePromise.then((succedMessage) => {
  console.log('Success: ', succedMessage);
}, (errorMessage) => {
  console.log('errorMessage: ', errorMessage);
});

console.log("Second Promise call");
somePromiseErr.then( (succedMessage) => {
  console.log('First Success: ', succedMessage);
}, (errorMessage) => {
  console.log('Second errorMessage: ', errorMessage);
});