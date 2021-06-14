import express from "express";
import fetch from "node-fetch";
import { URL_BASE, ADMIN, BASE_TYPE } from '../config.js';

const router = express.Router();

router.get("/productos", (req, res) => {
  fetch(`${URL_BASE}/api/productos`).then(res => res.json()).then((data) => {
    res.render("productos", { productos: data, admin: ADMIN });
  });
});

router.get("/productos/actualizar/:id", (req, res) => {
  const { id } = req.params;
  fetch(`${URL_BASE}/api/productos/${id}`).then(res => res.json()).then((data) => {
    if (BASE_TYPE === 7) { data.id = id };
    res.render("actualizar", { producto: data });
  });
});

router.get("/carrito", (req, res) => {
  fetch(`${URL_BASE}/api/carrito`).then(res => res.json()).then((data) => {
    res.render("carrito", { carrito: data, admin: ADMIN });
  });
});

export default router;