var asyncAdd = (a, b) => {
  return new Promise((resolve, reject) => {
    //logic code, BBDD acces for example
     if (typeof a === 'number' && typeof b === 'number') {  resolve(a + b);
      } else {  reject('Arguments must be numbers');  }    
  });
};


console.log("First Call");
asyncAdd(5, '7').then((object) => {
  console.log('First.1 Call Resolve: ', object);
  return asyncAdd(object, 33);
}).then((object) => {
  console.log('First.2 Call Resolve: ', object);
}).catch((errorMessage) => {
  console.log('First Call Reject:' + errorMessage);
});

console.log("Second Call");
asyncAdd(5, 7).then((object) => {
  console.log('Second.1 Call Resolve: ', object);
  return asyncAdd(object, 33);
}).then((object) => {
  console.log('Second.2 Call Resolve: ', object);
}).catch((errorMessage) => {
  console.log('Second Call Reject:' +errorMessage);
});
