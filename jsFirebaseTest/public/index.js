  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAJazAUYgMVC3GyelPMyIasvyNoJz20kjw",
    authDomain: "reactadmin-23718.firebaseapp.com",
    databaseURL: "https://reactadmin-23718.firebaseio.com",
    projectId: "reactadmin-23718",
    storageBucket: "reactadmin-23718.appspot.com",
    messagingSenderId: "55094350810"
  };
  firebase.initializeApp(config);

// 0. Autenticar
var ingresar = function(){
	var email = document.getElementById("correo").value;
	var password = document.getElementById("contrasena").value;


	firebase.auth().signInWithEmailAndPassword(email, password)
	.then(function(){
		console.log("Ingresaste correctamente");
		window.location = "agregarPlatillo.html";
	})
	.catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  console.log("Error en la autenticación: " + errorCode + " " + errorMessage);
	  // ...
	});
}

// Observador de el estado de atenticación

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    console.log("Si está autorizado");

  } else {
    // No user is signed in.
    console.log("No está autorizado");
    if(window.location.pathname !== "/index.html"){
    	window.location = "index.html";
    }
  }
});

var salir = function(){

    firebase.auth().signOut().then(function() {
	  // Sign-out successful.
	 console.log("Sesión terminada");
	}, function(error) {
	  // An error happened.
	  console.log("Error en terminar la sesión: " + error);
	});
	
}



 // 1. Crear platillos

 var database = firebase.database();

 var escribirPlatillo = function(pNombre, pDescripcion, pPrecio, pDireccion){
 	
 	database.ref('alimentos/').push({nombre: pNombre,
 		descripcion: pDescripcion,
 		precio: pPrecio,
 		cantidad: 0,
 		direccion: pDireccion
 	}).then(function(){
 		alert("Se agregó el platillo");
 		window.location = "agregarPlatillo.html";
 	})
 	.catch(function(error){
 		alert("No se agregó el platillo: " + error);
 	});
 }


 // 2. Leer nuestros platillos

var imprimirPlatillos = function(){
	 var query = database.ref('alimentos/');
	 query.on('value', function(snapshot){
	 	var ul = document.getElementById("lista");
	 	//console.log(snapshot.val());
	 	snapshot.forEach(function(childSnapshot){
	 		console.log(childSnapshot.key); //id
	 		console.log(childSnapshot.val()); //resto de info

	 		var childKey = childSnapshot.key;
	 		var childData = childSnapshot.val();

	 		var li = document.createElement("li");
	 		var div = document.createElement("div");
	 		var img = document.createElement("img");
	 		//var br = document.createElement("br");
	 		var button = document.createElement("button");

	 		button.setAttribute("id", childKey);
	 		button.setAttribute("class", "btn btn-danger");
	 		button.setAttribute("onclick", "eliminarPlatillos(this.id)");
	 		button.appendChild(document.createTextNode("Eliminar platillo"));

	 		img.src = childData.direccion;
	 		img.height = 60;
	 		img.alt = "Imagen del platillo";

	 		div.appendChild(img);
	 		div.style.float = "right";
	 		li.setAttribute("class", "list-group-item");
	 		li.appendChild(div);
	 		li.appendChild(document.createTextNode("Nombre: " + childData.nombre));
	 		li.appendChild(document.createElement("br"));
	 		li.appendChild(document.createTextNode("Descripcion: " + childData.descripcion));
	 		li.appendChild(document.createElement("br"));
	 		li.appendChild(document.createTextNode("Precio: " + childData.precio));
	 		li.appendChild(document.createElement("br"));
	 		li.appendChild(button);


	 		ul.appendChild(li);

	 	})
	 })
}
 // 3. Eliminar nuestros platillos

 var eliminarPlatillos = function(id){
 	database.ref('alimentos/' + id).remove()
 	.then(function(){
 		alert("Se eliminó el platillo");
 		console.log("Se eliminó el platillo");
 		window.location = "platillos.html";
 	})
 	.catch(function(error){
 		console.log("No se borró el platillo: " + error);
 	})
 }

function funcionDeLaForma(event){
	event.preventDefault();
	var nombre = document.getElementById("nombre").value;
	var descripcion = document.getElementById("descripcion").value;
	var precio = document.getElementById("precio").value;
	var imagen = document.getElementById("imgDir").value;

	//alert(nombre + descripcion + precio);


		escribirPlatillo(nombre, descripcion, precio, imagen);
		//alert("se agregó un nuevo platillo");


	return false;
}


// Visualizar Imagen

var storage = firebase.storage();
var storageRef = storage.ref();

function visualizarArchivo(){
	var preview = document.querySelector('img'); // queryselector trae el primer img que encuentra
	var archivo = document.querySelector('input[type=file]').files[0]; //trae el primer tipo input file.
	var lector = new FileReader();

	lector.onloadend = function(){
		preview.src=lector.result; // es como poner " img src=..."
	}

	if(archivo){
		lector.readAsDataURL(archivo);

		var subirImagen = storageRef.child('platillos/' + archivo.name).put(archivo);

		subirImagen.on('state_changed', function(snapshot){
			//Los cambios en la carga de nuestro archivo
		}, function(error){
			console.log("Error en la carga de la imagen: " + error)
		}, function(){
			console.log(subirImagen.snapshot.downloadURL);
			document.getElementById("imgDir").value = subirImagen.snapshot.downloadURL;
		})
	}
	else{
		preview.src="";
	}
}


// BEBIDAS

// Imagen

function visualizarArchivoBebidas(){
	var preview = document.querySelector('img'); // queryselector trae el primer img que encuentra
	var archivo = document.querySelector('input[type=file]').files[0]; //trae el primer tipo input file.
	var lector = new FileReader();

	lector.onloadend = function(){
		preview.src=lector.result; // es como poner " img src=..."
	}

	if(archivo){
		lector.readAsDataURL(archivo);

		var subirImagen = storageRef.child('bebidas/' + archivo.name).put(archivo);

		subirImagen.on('state_changed', function(snapshot){
			//Los cambios en la carga de nuestro archivo, listener
		}, function(error){ // devuelve errores
			console.log("Error en la carga de la imagen: " + error)
		}, function(){ // Si todo OK
			console.log(subirImagen.snapshot.downloadURL);
			document.getElementById("imgDir").value = subirImagen.snapshot.downloadURL;
		})
	}
	else{
		preview.src="";
	}
}

// Forma

function funcionDeLaFormaBebidas(event){
	event.preventDefault();
	var nombre = document.getElementById("nombre").value;
	var descripcion = document.getElementById("descripcion").value;
	var precio = document.getElementById("precio").value;
	var imagen = document.getElementById("imgDir").value;

	//alert(nombre + descripcion + precio);


		escribirBebida(nombre, descripcion, precio, imagen);
		//alert("se agregó un nuevo platillo");


	return false;
}

// Escribir bebida

 var escribirBebida = function(pNombre, pDescripcion, pPrecio, pDireccion){
 	
 	database.ref('bebidas/').push({nombre: pNombre,
 		descripcion: pDescripcion,
 		precio: pPrecio,
 		cantidad: 0,
 		direccion: pDireccion
 	}).then(function(){
 		alert("Se agregó bebida");
 		window.location = "agregarBebida.html";
 	})
 	.catch(function(error){
 		alert("No se agregó el platillo: " + error);
 	});
 }

// Imprimir Bebidas

var imprimirBebidas = function(){
	 var query = database.ref('bebidas/');
	 query.on('value', function(snapshot){
	 	var ul = document.getElementById("lista");
	 	//console.log(snapshot.val());
	 	snapshot.forEach(function(childSnapshot){
	 		console.log(childSnapshot.key);
	 		console.log(childSnapshot.val());

	 		var childKey = childSnapshot.key;
	 		var childData = childSnapshot.val();

	 		var li = document.createElement("li");
	 		var div = document.createElement("div");
	 		var img = document.createElement("img");
	 		//var br = document.createElement("br");
	 		var button = document.createElement("button");

	 		button.setAttribute("id", childKey);
	 		button.setAttribute("class", "btn btn-danger");
	 		button.setAttribute("onclick", "eliminarBebidas(this.id)");
	 		button.appendChild(document.createTextNode("Eliminar bebida"));

	 		img.src = childData.direccion;
	 		img.height = 60;
	 		img.alt = "Imagen del platillo";

	 		div.appendChild(img);
	 		div.style.float = "right";
	 		li.setAttribute("class", "list-group-item");
	 		li.appendChild(div);
	 		li.appendChild(document.createTextNode("Nombre: " + childData.nombre));
	 		li.appendChild(document.createElement("br"));
	 		li.appendChild(document.createTextNode("Descripcion: " + childData.descripcion));
	 		li.appendChild(document.createElement("br"));
	 		li.appendChild(document.createTextNode("Precio: " + childData.precio));
	 		li.appendChild(document.createElement("br"));
	 		li.appendChild(button);


	 		ul.appendChild(li);

	 	})
	 })
}

// ELiminar Bebidas

 var eliminarBebidas = function(id){
 	database.ref('bebidas/' + id).remove()
 	.then(function(){
 		alert("Se eliminó bebida");
 		console.log("Se eliminó bebida");
 		window.location = "bebidas.html";
 	})
 	.catch(function(error){
 		console.log("No se borró la bebida: " + error);
 	})
 }






