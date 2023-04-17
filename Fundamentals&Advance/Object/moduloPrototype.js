/*
***** Utilizar prototype para definir los métodos de la clase es más eficiente en términos de rendimiento 
***** que definir los métodos en el constructor de la función, ya que los métodos definidos en prototype 
***** se comparten entre todas las instancias de la clase. Esto significa que no se crea una copia del 
***** método para cada instancia de la clase.
***** Además, al utilizar prototype se puede evitar la creación de variables o métodos duplicados en cada 
***** instancia de la clase, lo que también puede mejorar el rendimiento.
***** Es importante tener en cuenta que el uso de prototype solo es efectivo si se utiliza para definir los 
***** métodos de la clase, no para definir sus propiedades. Las propiedades de la clase deben definirse 
***** dentro del constructor de la función para que cada instancia tenga sus propias copias de las mismas.
*/


function MiClaseFunction(nombre) {  //la forma antigua
    this.nombre = nombre;
}
MiClaseFunction.prototype.saludar = function () {
    console.log("Hola, mi nombre es " + this.nombre);
};




/************* NEW STYLE, es lo mismo ES6 - 2015 */
class MiClase { // al utilizar class en JavaScript para definir una clase, no es necesario utilizar la sintaxis de prototype para definir los métodos de la clase.
    constructor(nombre) {
        this.nombre = nombre;
    }
    saludar() {
        console.log("Hola, mi nombre es " + this.nombre);
    }
}
/************* NEW STYLE, es lo mismo ES6 - 2015 */

const instancia1 = new MiClaseFunction("Juan");
instancia1.saludar(); // Imprime "Hola, mi nombre es Juan"

const instancia2 = new MiClaseFunction("Maria");
instancia2.saludar(); // Imprime "Hola, mi nombre es Maria"

instancia1.saludar(); // Imprime "Hola, mi nombre es Juan"
