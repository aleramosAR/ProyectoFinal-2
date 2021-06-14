import knex from 'knex';
import fetch from "node-fetch";
import { URL_BASE, CONFIG_SQLITE } from '../../config.js';
import { formatDate } from '../../utils/utils.js'

export default class Carrito {
  constructor() {
    this.knex = knex(CONFIG_SQLITE);
    this.productos = [];
    this.carrito = {};

    (async () => {
      try {
        await this.crearTabla();
        console.log('Tabla en SQLITE3 de "Carrito" creada');
      } catch (err) {
        console.log(err);
      }
    })();
  }

  async crearTabla() {
    return this.knex.schema.dropTableIfExists('carrito')
    .then(async() => {
      return this.knex.schema.createTable('carrito', table => {
        table.increments('id').primary();
        table.string('productos').notNullable();
        table.string('timestamp').notNullable();
      })
      .then(async() => {
        await this.knex('carrito').insert({
          productos: "",
          timestamp: formatDate(new Date())
        });
      })
    })
  }

  async read() {
    const carrito = await this.knex('carrito').select();
    let carritoProds = [];
    let carritoIDS = [];

    if (carrito[0].productos != "") {
      await this.getProductos();
      carritoIDS = carrito[0].productos.split(",").map(x=>+x);
      carritoIDS.forEach(x => {
        if (x != "") {
          carritoProds.push(this.productos.filter(prod => prod.id === Number(x))[0]);
        }
      });
    }

    this.carrito = {
      id: carrito[0].id,
      timestamp: carrito[0].timestamp,
      productos: carritoIDS
    };

    return {
      id: carrito[0].id,
      timestamp: carrito[0].timestamp,
      productos: carritoProds
    };
  }

  // Devuevo el listado completo, si el listado esta vacio devuelvo false para hacer el chequeo
  async readProds(id) {
    await this.read();
    if (this.carrito.productos.length) {
      if (id) {
        if (!this.carrito.productos.includes(parseInt(id))) {
          return { error: "Producto no encontrado en el carrito." };
        }
        const res = await fetch(`${URL_BASE}/api/productos/${id}`);
        return await res.json();
      }

      let carritoProds = [];
      this.carrito.productos.forEach(x => {
        carritoProds.push(this.productos.filter(prod => prod.id === x)[0]);
      });
      return carritoProds;
    }
    return false;
  }

  async addProd(id) {
    await this.read();

    if(!this.carrito.productos.includes(Number(id))) {
      const res = await fetch(`${URL_BASE}/api/productos/${id}`);
      const producto = (res.status === 200) ? await res.json() : null;

      if (producto) {
        this.carrito.productos.push(parseInt(id));
        const prodsString = this.carrito.productos.toString();
        await this.knex.from('carrito').where("id", this.carrito.id).update({ productos: prodsString })
        return producto;
      }
      return { error: `El producto con el id '${id}' no existe.` };
    }
    return { error: "Producto ya existente en el carrito." };
  }

  async deleteProd(id) {
    const prodId = parseInt(id);

    await this.read();
    // Chequeo que item del array tiene el mismo ID para seleccionarlo
    let index;
    const productosList = this.carrito.productos;
    for (let i = 0; i < productosList.length; i++) {
      if (productosList[i] === prodId) {
        index = i;
        break;
      }
    };
    // // Si el item existe lo elimino del carrito.
    if (index != undefined) {
      const producto = await this.readProds(productosList[index]);
      this.carrito.productos.splice(index, 1);
      const prodsString = this.carrito.productos.toString();
      await this.knex.from('carrito').where("id", this.carrito.id).update({ productos: prodsString });
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