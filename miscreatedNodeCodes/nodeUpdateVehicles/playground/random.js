function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  console.log(getRandomArbitrary(2500, 4500));



  const object1 = {
    a: 'somestring',
    b: 42,
    c: false
  };


  console.log(Object.keys(object1)); // Array with keys
  console.log(Object.values(object1)); // Array with values
  console.log(Object.entries(object1)); // Array with key and values


  for(let key in object1){  //Iterate keys Object
    console.log(key);
  }

  for(let value of Object.values(object1)){ //Iterate values Object
    console.log(value);
  }
  
  for (const [key, value] of Object.entries(object1)) { //Iterate keys & values Object
    console.log(`${key}: ${value}`);
  }
  

  // expected output: Array ["a", "b", "c"]