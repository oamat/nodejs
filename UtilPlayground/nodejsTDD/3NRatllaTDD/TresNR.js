class TresNR {
    constructor () {
        this.reset();
        //console.log("metodo constructor TresNR initializing");
    }
    reset(){
        var vector0 = [0,0,0];
        var vector1 = [0,0,0];
        var vector2 = [0,0,0];
        this._tablero = [ vector0, vector1, vector2];
        this._turn = true;
    }
    tablero() { return this._tablero; }
    
    captura(i,j) { 
        if (this.isTurn1() && this.isfree(i,j)) { 
            this._tablero[i][j] = 1; 
            this.changeTurn();
            return this._tablero;
        }
        if (this.isTurn2() && this.isfree(i,j)) {
            this._tablero[i][j] = 2; 
            this.changeTurn();
            return this._tablero;
        }
        console.log(" La Casilla está llena, tira otra vez");
        return this._tablero;
    }

    isfree(i,j) { 
          if (this._tablero[i][j] != 0)   return false;
          return true;       
    }
         
    isTurn1() { 
          return this._turn;       
    }
    isTurn2() { 
          return !this._turn;       
    }
    changeTurn() { 
        //console.log("turn1:" + this._turn);
          this._turn = !this._turn;  
        //console.log("turn2:" + this._turn);     
    }

    youWin(){
        var value=1;
        if (this.isTurn2()) value=2;
        if (this._tablero[0][0] == value && this._tablero[0][1] == value && this._tablero[0][2] == value) return true;
        if (this._tablero[1][0] == value && this._tablero[1][1] == value && this._tablero[1][2] == value) return true;
        if (this._tablero[2][0] == value && this._tablero[2][1] == value && this._tablero[2][2] == value) return true;
        if (this._tablero[0][0] == value && this._tablero[1][0] == value && this._tablero[2][0] == value) return true;
        if (this._tablero[0][1] == value && this._tablero[1][1] == value && this._tablero[2][1] == value) return true;
        if (this._tablero[0][2] == value && this._tablero[1][2] == value && this._tablero[2][2] == value) return true;
        if (this._tablero[0][0] == value && this._tablero[1][1] == value && this._tablero[2][2] == value) return true;
        if (this._tablero[0][2] == value && this._tablero[0][1] == value && this._tablero[0][0] == value) return true;
        return false;
    }
    anyoneWin(){
        if (this.youWin()) return true;
        this.changeTurn();
        if (this.youWin()) return true;
        this.changeTurn();
        return false;
    }

    isFull(){
        for (i=0; i<3; i++){
            for (j=0; j<3; j++){
                if (this._tablero[i][j] == 0) return false;
            }
        }
      return true;
    }
    isfinish(){
        if (this.anyoneWin()) return true;
        return this.isFull();
    }
}

module.exports = TresNR;