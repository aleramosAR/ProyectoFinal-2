import path from "path";
import express from "express";
import fetch from "node-fetch";
import handlebars from "express-handlebars";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import { PORT, URL_BASE, ADMIN, BASE_TYPE, configMongo } from './config.js';
import prodRoutes from "./routes/ProductRoutes.js";
import carritoRoutes from "./routes/CarritoRoutes.js";
import frontRoutes from "./routes/FrontRoutes.js";


const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);



if (BASE_TYPE === 5) {
	(async () => {
		try {
			await configMongo("local");
			connectSocket();
		} catch (err) {
			console.log(err.message);
		}
	})();
} else if (BASE_TYPE === 6) {
	(async () => {
		try {
			await configMongo("dbaas");
			connectSocket();
		} catch (err) {
			console.log(err.message);
		}
	})();
} else {
	connectSocket();
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use('/', frontRoutes);
app.use('/api/productos', prodRoutes);
app.use('/api/carrito', carritoRoutes);

app.set("views", "./views");
app.set("view engine", "hbs");

app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    defaultLayout: "layout.hbs",
		helpers: { basetype: String(BASE_TYPE) },
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials",
  })
);

// Middleware para mostrar error si la ruta no existe
app.use(function(req, res, next) {
	res.status(404)
	res.json({error : -2, descripcion: `Ruta '${req.url}' no implementada`});
});

// Funcion que devuelve los productos y emite el llamado a "listProducts"
const getProducts = () => {
	fetch(`${URL_BASE}/api/productos`)
	.then((res) => res.json())
	.then((data) => {
		const prods = { productos: data }
		io.sockets.emit("listProducts", { productos: prods, admin: ADMIN });
	});	
}

// Funcion que recarga la pagina con los productos filtrados
const filterProducts = productos => {
	const prods = { productos: productos }
	io.sockets.emit("listProducts", { productos: productos, admin: ADMIN });	
}

// Funcion que devuelve los productos y emite el llamado a "listCarrito"
const getCarrito = () => {
	fetch(`${URL_BASE}/api/carrito`)
	.then((res) => res.json())
	.then((data) => {
		io.sockets.emit("listCarrito", { carrito: data, admin: ADMIN  });
	});
}




function connectSocket() {
	io.on("connection", (socket) => {
		console.log("Nuevo cliente conectado!");
		const url = socket.handshake.headers.referer.split("/").pop();
		switch (url) {
			case "productos":
				(async ()=>{
					const initialProducts = getProducts();
					io.sockets.emit("listProducts", { productos: initialProducts, admin: ADMIN });
				})()
				break;
			case "carrito":
				(async ()=>{
					const initialCarrito = getCarrito();
					io.sockets.emit("listCarrito", { carrito: initialCarrito, admin: ADMIN  });
				})()
				break;
		}
		
		/* Escucho los mensajes enviado por el cliente y se los propago a todos */
		socket.on("postProduct", () => {
			getProducts();
		}).on("removeProduct", () => {
			getProducts();
		}).on("filterProducts", (productos) => {
			filterProducts(productos);
		}).on("removeCarritoProduct", () => {
			getCarrito();
		}).on('disconnect', () => {
			console.log('Usuario desconectado')
		});
	});
}

// Conexion a server con callback avisando de conexion exitosa
const server = httpServer.listen(PORT, () => { console.log(`Ya me conecte al puerto ${PORT}.`) });
server.on('error', (error) => console.log(`Hubo un error inicializando el servidor: ${error}`));


// - nombre : el nombre del producto debe coincidir exactamente
// - código : el código del producto debe coincidir exactamente
// - precio : por rango de precio
// - stock : por rango de stock