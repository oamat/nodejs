
const callback1 = (msg) => { //Definición callback1 
    console.log('Entering callback1 msg :' + msg);
}

const callback2 = (msg) => { //Definición callback1 
    console.log('Entering callback2 msg : ' + msg);
}

function printMsg(msg, ...manyMoreArgs) { //pasamos los callbacks que queramos por param
    console.log('Entering function msg ' + msg);
    console.log("manyMoreArgs", manyMoreArgs);
    for (i = 0;  i < manyMoreArgs.length; i++) {
        manyMoreArgs[i]("nn");
    }
}

printMsg("mensaje", callback1, callback2);