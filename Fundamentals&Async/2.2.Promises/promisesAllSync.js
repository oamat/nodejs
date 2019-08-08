const promise1 = async function (entry) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {  //añadimos asincronia
      //logic code, BBDD acces for example
      if (entry) resolve(' promise1 resolved ');
      else reject(' promise1 Error ');
    }, 500);
  });
}

const promise2 = async function (entry) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {  //añadimos asincronia
      //logic code, BBDD acces for example
      if (entry) resolve(' promise2 resolved ');
      else reject(' promise2 Error ');
    }, 500);
  });
}

const promise3 = async function (entry) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {  //añadimos asincronia
      //logic code, BBDD acces for example
      if (entry) resolve(' promise3 resolved ');
      else reject(' promise3 Error ');
    }, 500);
  });
}



const getSyncConcurrentlyPromises = async function () {
  try {
    console.log("call Promise.all(... (true) )");
    await Promise.all([promise1(true), promise2(true), promise3(true)]).then(values => {
      console.log(values);
    }, errors => {
      console.log(errors)
    });
    console.log("call Promise.all(... (false) )");
    await Promise.all([promise1(false), promise2(false), promise3(false)]).then(values => {
      console.log(values);
    }, error => {
      console.log(error);
      throw new Error(error);
    });
  } catch (error) {
    console.log("catch error : " + error)
  }
}


// Start function
const start = async function () {
  console.log("call getSyncConcurrentlyPromises()");
  await getSyncConcurrentlyPromises();
  console.log("COMPLETED ???");
}

// Call start
start();



