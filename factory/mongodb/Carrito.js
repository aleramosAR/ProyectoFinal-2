import fetch from "node-fetch";
import mongoose from 'mongoose';
import { URL_BASE } from '../../config.js';
import { formatDate } from '../../utils/utils.js'

export default class Carrito {
  constructor() {
    this.productos = null;

    const Schema = mongoose.Schema;
		const carritoSchema = new Schema({
			productos: Array,
			timestamp: String,
		});
    carritoSchema.virtual('id').get(function(){ return this._id.toHexString(); });
		carritoSchema.set('toJSON', { virtuals: true });
    
		this.carritoModel = mongoose.model('carrito', carritoSchema);

    // Elimino el carrito si ya existia uno
    mongoose.connection.dropCollection('carritos');


    (async () => {
      const carritos = await this.carritoModel.findOne({});
      if(!carritos) {
        const newCarrito = new this.carritoModel({
          productos: [],
          timestamp: formatDate(new Date())
        });
        await newCarrito.save();
      }
    })();
		
  }

  async read() {
    const carrito = await this.carritoModel.findOne({});
    const productos = carrito.productos;

    if (productos.length > 0) {
      const carritoprods = [];
      await this.getProductos();
      productos.forEach(x => carritoprods.push(this.productos.filter(prod => prod._id === x)[0]));
      carrito.productos = carritoprods;
    }
    return carrito;
  }

  // Devuevo el listado completo, si el listado esta vacio devuelvo false para hacer el chequeo
  async readProds(id) {
    const carrito = await this.carritoModel.findOne({});
    const productos = carrito.productos;

    if (productos.length > 0) {
      if (id) {
        if (!productos.includes(id)) {
          return { error: "Producto no encontrado en el carrito." };
        }
        const res = await fetch(`${URL_BASE}/api/productos/${id}`);
        return await res.json();
      }
      const carritoprods = [];
      await this.getProductos();
      productos.forEach(x => carritoprods.push(this.productos.filter(prod => prod._id === x)[0]));
      return carritoprods;
    }
    return false;
  }

  async addProd(id) {
    const carrito = await this.carritoModel.findOne({});
    const productos = carrito.productos;
    if(!productos.includes(id)) {
      const res = await fetch(`${URL_BASE}/api/productos/${id}`);
      const producto = (res.status === 200) ? await res.json() : null;   
      if (producto) {
        productos.push(id);
        await this.carritoModel.updateOne({}, { productos: productos });
        return producto;
      }
      return { error: `El producto con el id '${id}' no existe.` };
    }
    return { error: "Producto ya existente en el carrito." };
  }

  async deleteProd(id) {
    // Chequeo que item del array tiene el mismo ID para seleccionarlo
    let index;
    const carrito = await this.carritoModel.findOne({});
    const productosList = carrito.productos;
    for (let i = 0; i < productosList.length; i++) {
      if (productosList[i] === id) {
        index = i;
        break;
      }
    };
    // // Si el item existe lo elimino del carrito.
    if (index != undefined) {
      const producto = await this.readProds(productosList[index]);
      productosList.splice(index, 1);
      await this.carritoModel.updateOne({}, { productos: productosList });
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