import fetch from "node-fetch";
import admin from "firebase-admin";
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
    this.db = admin.firestore();
		this.queryRef = this.db.collection('carrito');

    (async () => {
      try {
        const snapshot = await this.queryRef.get();
        if(!snapshot.size) {
          await this.queryRef.add({
            timestamp: formatDate(new Date()),
            productos: []
          })
        };
      } catch (err) {
        console.log(err);
      }
    })();
    
  }

  async read() {
    try {
      const snap = await this.queryRef.limit(1).get();
      const carrito = snap.docs[0];
      const carritoprods = [];
      if (carrito.data().productos.length > 0) {
        await this.getProductos();
        carrito.data().productos.forEach(x => carritoprods.push(this.productos.filter(prod => prod.id === x)[0]));
      }
      return  {
        id: carrito.id,
        timestamp: carrito.data().timestamp,
        productos: carritoprods
      };
    } catch (err) {
      return false;
    }
  }

  // Devuevo el listado completo, si el listado esta vacio devuelvo false para hacer el chequeo
  async readProds(id) {
    try {
      const snap = await this.queryRef.limit(1).get();
      const carrito = snap.docs[0];

      if (carrito.data().productos.length == 0) {
        return false;
      }

      if (id) {
        if (!carrito.data().productos.includes(id)) {
          return false;
        }
        const res = await fetch(`${URL_BASE}/api/productos/${id}`);
        return await res.json();
      }

      const carritoprods = [];
      if (carrito.data().productos.length > 0) {
        await this.getProductos();
        carrito.data().productos.forEach(x => carritoprods.push(this.productos.filter(prod => prod.id === x)[0]));
      }
      return carritoprods;
    } catch (err) {
      return false;
    }
  }

  async addProd(id) {
    try {
      const snap = await this.queryRef.limit(1).get();
      const carrito = snap.docs[0];

      if(!carrito.data().productos.includes(id)) {
        const res = await fetch(`${URL_BASE}/api/productos/${id}`);
        const producto = (res.status === 200) ? await res.json() : null;
        if (producto) {
          const array = carrito.data().productos;
          array.push(id);
          await this.queryRef.doc(carrito.id).update({ productos: array });
          return producto;
        }
        return { error: `El producto con el id '${id}' no existe.` };
      }
      return { error: "Producto ya existente en el carrito." };

    } catch (err) {
      return false;
    }
  }

  async deleteProd(id) {
    try {
      const snap = await this.queryRef.limit(1).get();
      const carrito = snap.docs[0];

      if(carrito.data().productos.includes(id)) {
        const array = carrito.data().productos;
        const index = array.indexOf(id);
        if (index !== -1) {
          array.splice(index, 1);
        }
        return await this.queryRef.doc(carrito.id).update({ productos: array });
      }
    } catch (err) {
      return false;
    }
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