/************* Class ES6 - 2015 */

class MiClase { // al utilizar class en JavaScript para definir una clase, no es necesario utilizar la sintaxis de prototype para definir los métodos de la clase.
    constructor(nombre) {
        this.nombre = nombre;
    }
    saludar() {
        console.log("Hola, mi nombre es " + this.nombre);
    }
}


/************* OLD STYLE, es lo mismo */
function MiClaseFunction(nombre) {  //la forma antigua
    this.nombre = nombre;
}
MiClaseFunction.prototype.saludar = function () {
    console.log("Hola, mi nombre es " + this.nombre);
};
/************* OLD STYLE, es lo mismo */

const instancia1 = new MiClase("Juan");
instancia1.saludar(); // Imprime "Hola, mi nombre es Juan"

const instancia2 = new MiClase("Maria");
instancia2.saludar(); // Imprime "Hola, mi nombre es Maria"

instancia1.saludar(); // Imprime "Hola, mi nombre es Juan"

const instancia3 = Object.create(instancia2);

instancia3.saludar();
instancia3.surname = "PEPE";