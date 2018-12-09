var chai = require('chai');
var assert = chai.assert;// we are using the "assert" style of Chai of MOCHA
var TresNR = require("./TresNR");
var tresNR = new TresNR();
describe('OBJECT TEST TresNR', function() {
  it('inicialització', function() {
    tresNR.reset(); 
    for (i=0; i<3; i++){
      for (j=0; j<3; j++){
        //console.log("[" + i + " ," + j + "] : " + tresNR.tablero()[i][j]);
        assert.equal(tresNR.tablero()[i][j], 0);
      }
    }
 });
  it('Capturar tirada', function() {
     tresNR.reset();
     assert.isObject(tresNR);
     assert.isFunction(tresNR.captura, "ok");
     if (tresNR.isTurn1()) assert.equal(tresNR.captura(0,0)[0][0],1);
     if (tresNR.isTurn2()) assert.equal(tresNR.captura(2,2)[2][2],2);
     if (tresNR.isTurn1()) assert.equal(tresNR.captura(1,1)[1][1],1);
     if (tresNR.isTurn2()) assert.equal(tresNR.captura(1,2)[1][2],2);
 });
  it('posició ocupada', function() {
    tresNR.reset();
    assert.equal(tresNR.isfree(2,2), true);
    tresNR.captura(2,2);
    assert.equal(tresNR.isfree(2,2), false); 
 });
  
 it('Torn de tirada', function() {
        tresNR.reset();
        assert.equal(tresNR.isTurn1(), true);
        assert.equal(tresNR.isTurn2(), false);
        tresNR.captura(1,0);
        assert.equal(tresNR.isTurn1(), false);
        assert.equal(tresNR.isTurn2(), true);
 });
it('has guanyat?', function() {
     tresNR.reset();
     assert.equal(tresNR.youWin(),false);
     tresNR.captura(0,0);
     tresNR.changeTurn();
     tresNR.captura(0,1);
     tresNR.changeTurn();
     tresNR.captura(0,2);
     tresNR.changeTurn();
     assert.equal(tresNR.youWin(),true);  
 }); 
   it("S'ha acabat la partida?", function() {
        tresNR.reset();
        assert.equal(tresNR.isfinish(),false);
        tresNR.captura(1,0);
        tresNR.changeTurn();
        tresNR.captura(1,1);
        tresNR.changeTurn();
        tresNR.captura(1,2);
        assert.equal(tresNR.isfinish(),true);

        tresNR.reset();
        assert.equal(tresNR.isfinish(),false);
        for (i=0; i<3; i++){
          for (j=0; j<3; j++){
              tresNR.captura(i,j);
              tresNR.changeTurn();
       }
       assert.equal(tresNR.isfinish(),true);
    } 
   });

});