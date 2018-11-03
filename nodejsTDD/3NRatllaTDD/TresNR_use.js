var TresNR = require('./TresNR');
var tresNR = new TresNR();

var tablero =tresNR.tablero(); 
    for (i=0; i<3; i++){
      for (j=0; j<3; j++){
        console.log("[" + i + " ," + j + "] : " + tresNR.tablero()[i][j]);
       }
    }


console.log("you Win:" + tresNR.youWin());
console.log("anyone Win:" + tresNR.anyoneWin());

 tresNR.captura(1,0);
 tresNR.changeTurn();
 tresNR.captura(1,1);
 tresNR.changeTurn();
 var tablero = tresNR.captura(1,2);
 tresNR.changeTurn();
console.log("captura final= " +  tablero[1][0] + "-" + tablero[1][1] + "-" +  tablero[1][2]);

console.log("you Win:" + tresNR.youWin());
console.log("anyone Win:" + tresNR.anyoneWin());
 
 

 console.log( tresNR.captura(0,0)[0][0] );

 

 tresNR.reset();
    console.log(tresNR.isfree(2,2));
    tresNR.captura(2,2);
    console.log(tresNR.isfree(2,2)); 


 var turn = false + false;
 console.log(turn);
turn = false + true;
 console.log(turn);

 tresNR.reset();
 console.log("a-"+tresNR.anyoneWin());
 console.log("a-"+tresNR.isFull());
 console.log("a- "+tresNR.isfinish());
 for (i=0; i<3; i++){
          for (j=0; j<3; j++){
              console.log(tresNR.captura(i,j)[i][j]);
       }
 }
 console.log("a-"+tresNR.anyoneWin());
 console.log("a-"+tresNR.isFull());
 console.log("a-"+tresNR.isfinish());