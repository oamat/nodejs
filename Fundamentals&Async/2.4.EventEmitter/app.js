const EventEmitter = require('events');

function doSomeAsynchronousOperation(req, res) {
    let myEvent = new EventEmitter();

    // runs asynchronously
    setTimeout(function(){
        myEvent.emit('done', true);
    }, 1000);

    return myEvent;
}

// Invoke the function

let event = doSomeAsynchronousOperation("req", "res");

event.on('error', function(error) {
    console.log(error);
    throw Error(error.message);
    console.log("you won't pass..");
});

event.on('done', function(result) {
    console.log("result OK"); // true
    console.log("COMPLETED  ??? ");
    
});





 