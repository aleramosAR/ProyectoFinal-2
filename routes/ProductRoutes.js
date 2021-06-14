import express from "express";
import ProductosFactory from "../factory/ProductosFactory.js";
import { ADMIN, BASE_TYPE, configFirebase } from '../config.js';

if (BASE_TYPE === 7) await configFirebase();

const factory = new ProductosFactory(BASE_TYPE);
const productos = factory.getBase();

const router = express.Router();
router.use(express.json());

// Cargo el listado de productos, devuelvo un mensajes si el listado esta vacio (devuelve false)
router.get("/", async(req, res) => {
  let filtros = null;
  if(Object.keys(req.query).length) {
    filtros = [];
    Object.keys(req.query).map(item => filtros.push(item));
    Object.values(req.query).map(item => filtros.push(item));
  };
  const prods = await productos.read(null, filtros);
  if (!prods) {
    return res.status(404).json({
      error: "No hay productos cargados.",
    });
  }
  res.status(200).json(prods);
});

// Devuelvo un determinado producto
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const prod = await productos.read(id);
  if (prod) {
    return res.status(200).json(prod);
  }
  res.status(404).json({ error: "Producto no encontrado." });
});

// Agrego un producto
router.post("/", async(req, res) => {
  // Si el usuario no es administrador no se agrega el producto.
  if (!ADMIN) {
    return res.status(403).json(
      { error : -1, descripcion: "Ruta /productos, metodo 'agregar' no autorizado"}
    );
  }
  const product = req.body;
  if (await productos.create(product)) {
    res.status(201).json(product);
  }
  res.status(400).send();
});

// Actualizo un producto
router.put("/actualizar/:id", async(req, res) => {
  // Si el usuario no es administrador no se permite la actualizacion.
  if (!ADMIN) {
    return res.status(403).json(
      { error : -1, descripcion: "Ruta /productos, metodo 'actualizar' no autorizado"}
    );
  }
  const { id } = req.params;
  const product = req.body;
  // Ejecuto el update y recibo la respuesta en una variable.
  // Si el producto que intente actualizar existe lo devuelvo con un status 200.
  // Si el producto que intente actualizar no existe devuelvo un error con un status 404.
  const prod = await productos.update(id, product);
  if (prod) {
    return res.status(200).json(prod);
  }
  res.status(404).json({
    error: "Producto no encontrado."
  });
});

// Elimino un producto
router.delete("/borrar/:id", async(req, res) => {
  // Si el usuario no es administrador no se elimina el producto.
  if (!ADMIN) {
    return res.status(403).json(
      { error : -1, descripcion: "Ruta /productos, metodo 'borrar' no autorizado"}
    );
  }
  const { id } = req.params;

  // Elimino el producto segun el id que se paso y recibo la respuesta en una variable.
  // Si el producto que intente eliminar existe lo devuelvo con un status 200.
  // Si el producto que intente eliminar no existe devuelvo un error con un status 404.
  const prod = await productos.delete(id);
  if (prod) {
    return res.status(200).json(prod);
  }
  res.status(404).json({
    error: "Producto no encontrado."
  });
});

export default router;