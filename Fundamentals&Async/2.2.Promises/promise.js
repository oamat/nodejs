async function promise(entry) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {  //añadimos asincronia
      //logic code, BBDD acces for example
      if (entry) resolve(' promise resolved ');
      else reject(' promise Error ');
    }, 500);
  });
}


const start = async function () {
  console.log("call await promise with true");
  await promise(true)
    .then((result) => {
      console.log('Success: ', result);
    })
    .catch((error) => {
      console.log('error: ', error);
    });
  console.log("call await promise with false");
  await promise(false)
    .then((result) => {
      console.log('Success: ', result);
    })
    .catch((error) => {
      console.log('Error: ', error);
    });


  console.log('COMPLETED ?');
}

//start process
start();