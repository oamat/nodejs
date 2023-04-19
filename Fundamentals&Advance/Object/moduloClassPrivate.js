const constante = "I am a constant";

class Something {
    #property;


    constructor(){
      this.#property = "I am a Private Property";
    }
  
    #privateMethod() {
      return 'I am a Private Method';
    }
  
    getPrivateProperty() {
        return this.#property;
    }

    getPrivateMethod() {
        return this.#privateMethod();
    }

    getConstant() {
        return constante;
    }

  }
  
  const instance = new Something();
  console.log(instance.property); //=> undefined
  console.log(instance.privateMethod); //=> undefined
  console.log(instance.getPrivateProperty()); //=> I am a Private Property
  console.log(instance.getPrivateMethod()); //=> I am a Private Method
  console.log(instance.getConstant()); //=> I am a constant
  /****ERROR****/
  //console.log(instance.#property); //=> Syntax error