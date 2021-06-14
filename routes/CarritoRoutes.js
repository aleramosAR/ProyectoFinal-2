import express from "express";
import CarritoFactory from "../factory/CarritoFactory.js";
import { BASE_TYPE, configFirebase } from '../config.js';

if (BASE_TYPE === 7) await configFirebase();

const factory = new CarritoFactory(BASE_TYPE);
const carrito = factory.getBase();

const router = express.Router();
router.use(express.json());

// Cargo el carrito completo
router.get("/", async(req, res) => {
  const carritoData = await carrito.read();
  if (!carritoData) {
    return res.status(404).json({
      error: "No hay carritos creados.",
    });
  }
  res.json(carritoData);
});

// Cargo el listado de productos, devuelvo un mensajes si el listado esta vacio (devuelve false)
router.get("/productos", async(req, res) => {
  const productos = await carrito.readProds();
  if (!productos) {
    return res.status(404).json({
      error: "No hay productos en el carrito.",
    });
  }
  res.json(productos);
});

// Devuelvo un determinado carrito
router.get("/:id", async(req, res) => {
  const { id } = req.params;
  const producto = await carrito.readProds(id);
  if (producto) {
    return res.json(producto);
  }
  res.status(404).json({
    error: "Producto no encontrado en el carrito."
  });
});

// Agrego un producto al carrito
router.post("/agregar/:id", async(req, res) => {
  const { id } = req.params;
  const newProduct = await carrito.addProd(id);
  if (newProduct) {
    res.status(201).json(newProduct);
  }
  res.status(400).send();
});

// Elimino un producto
router.delete("/borrar/:id", async(req, res) => {
  const { id } = req.params;

  // Elimino el producto segun el id que se paso y recibo la respuesta en una variable.
  // Si el producto que intente eliminar existe lo devuelvo con un status 200.
  // Si el producto que intente eliminar no existe devuelvo un error con un status 404.
  const prod = await carrito.deleteProd(id);
  if (prod) {
    return res.status(200).json(prod);
  }
  res.status(404).json({
    error: "Producto no encontrado en el carrito."
  });
});

export default router;