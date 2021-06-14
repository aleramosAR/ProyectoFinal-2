import fetch from "node-fetch";
import { URL_BASE } from '../../config.js';
import { formatDate } from '../../utils/utils.js'

export default class Carrito {
  constructor() {
    this.productos = null;
    this.CARRITO = {
      id: 0,
      timestamp: new Date(),
      productos: []
    };
  }

  async read() {
    const carritoprods = [];
    if (this.CARRITO.productos && this.CARRITO.productos.length > 0) {
      await this.getProductos();
      this.CARRITO.productos.forEach(x => carritoprods.push(this.productos.filter(prod => prod.id === x)[0]));
    }
    return {
      id: this.CARRITO.id,
      timestamp: formatDate(this.CARRITO.timestamp),
      productos: carritoprods
    };
  }

  // Devuevo el listado completo, si el listado esta vacio devuelvo false para hacer el chequeo
  async readProds(id) {
    if (this.CARRITO.productos.length == 0) {
      return false;
    }
    if (id) {
      if (!this.CARRITO.productos.includes(parseInt(id))) {
        return { error: "Producto no encontrado en el carrito." };
      }
      const res = await fetch(`${URL_BASE}/api/productos/${id}`);
      return await res.json();
    }
    
    const carritoprods = [];
    await this.getProductos();
    this.CARRITO.productos.forEach(x => carritoprods.push(this.productos.filter(prod => prod.id === x)[0]));
    return carritoprods;
  }

  async addProd(id) {
    if(!this.CARRITO.productos.includes(Number(id))) {
      const res = await fetch(`${URL_BASE}/api/productos/${id}`);
      const producto = (res.status === 200) ? await res.json() : null;   
      if (producto) {
        this.CARRITO.productos.push(parseInt(id));
        return producto;
      }
      return { error: `El producto con el id '${id}' no existe.` };
    }
    return { error: "Producto ya existente en el carrito." };
  }

  async deleteProd(id) {
    const prodId = parseInt(id);
    // Chequeo que item del array tiene el mismo ID para seleccionarlo
    let index;
    const productosList = this.CARRITO.productos;
    for (let i = 0; i < productosList.length; i++) {
      if (productosList[i] === prodId) {
        index = i;
        break;
      }
    };
    // Si el item existe lo elimino del carrito.
    if (index != undefined) {
      const producto = await this.readProds(productosList[index]);
      productosList.splice(index, 1);
      return producto;
    };
  }

  async getProductos() {
    const res = await fetch(`${URL_BASE}/api/productos`);
    if(res.status === 200) {
      this.productos = await res.json();
    } else {
      this.productos = [];
    };
  }
  
}