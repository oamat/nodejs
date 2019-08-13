async function resolveAfter2Seconds(message) {    
      setTimeout(() => {
        console.log(message + new Date())
      }, 2000);
  }
  
  
  async function methodAsyncWithAwait() {
    console.log("Start methodAsyncWithAwait() : " + new Date());
    await resolveAfter2Seconds("1.1.methodAsyncWithAwait 1 : ").then(console.log("**** then method1.1 " + new Date()));
    await resolveAfter2Seconds("1.2.methodAsyncWithAwait 2 : ").then(console.log("**** then method1.2 " + new Date()));;
    console.log("##END methodAsyncWithAwait() : " + new Date());
  }
  
  async function methodAsyncWithOUTAwait() {
    console.log("Start methodAsyncWithOUTAwait() : " + new Date());
    resolveAfter2Seconds("2.1.methodAsyncWithOUTAwait() 1 : ").then(console.log("**** then method2.1 " + new Date()));
    resolveAfter2Seconds("2.2.methodAsyncWithOUTAwait() 2 : ").then(console.log("**** then method2.2 " + new Date()));
    console.log("##END methodAsyncWithOUTAwait() : " + new Date());
  }
  
 function methodSimple() {
    console.log("Start methodSimple() : " + new Date());
    resolveAfter2Seconds("3.1.methodSimple() 1 : ").then(console.log("**** then method3.1 " + new Date()));
    resolveAfter2Seconds("3.2.methodSimple() 2 : ").then(console.log("**** then method3.2 " + new Date()));
    console.log("##END methodSimple() : " + new Date());
  }
  
  methodAsyncWithAwait().then(console.log("--> finish call method1"));
  methodAsyncWithOUTAwait().then(console.log("--> finish call method2"));
  methodSimple(); // because is not async: Exception with .then(console.log("finish method1"));
  console.log("--> FINISH? ---> NO in Node");

  
  