import fetch from "node-fetch";
import { URL_BASE } from '../../config.js';
import tempData from '../../utils/tempData.js';

export default class Productos {
	constructor() {
		this.PRODUCTS = [];
		this.currentID = 1;

		// Agrego datos temporales
		tempData.map(item => {
			item.id = this.currentID;
			this.currentID++;
			this.PRODUCTS.push(item);
		});
	}

	async create(data) {
		if (data.nombre === '' || typeof data.nombre === 'undefined') return false;
		if (data.precio === '' || typeof data.precio === 'undefined') return false;
		if (data.foto === '' || typeof data.foto === 'undefined') return false;
		this.PRODUCTS.push({
			nombre: data.nombre,
			descripcion: data.descripcion,
			codigo: parseInt(data.codigo),
			foto: data.foto,
			precio: parseInt(data.precio),
			stock: parseInt(data.stock),
			id: this.currentID++,
			timestamp: Date.now(),
		});
		return true;
	}

	async read(id, filtros = null) {
		if (this.PRODUCTS.length < 1) {
			return false;
		}
		try {
			if (id) {
				// Devuelvo resultado si hago una busqueda por ID
				return this.PRODUCTS.filter(prod => prod.id === parseInt(id))[0];
			} else {
				if (filtros != null) {
					switch(filtros[0]) {
						case "nombre":
              return this.PRODUCTS.filter(prod => prod.nombre === filtros[1]);
						case "codigo":
              return this.PRODUCTS.filter(prod => prod.codigo === parseInt(filtros[1]));
						case "premin":
              return this.PRODUCTS.filter(prod => prod.precio >= parseInt(filtros[2]) && prod.precio <= parseInt(filtros[3]));
						case "stkmin":
              return this.PRODUCTS.filter(prod => prod.stock >= parseInt(filtros[2]) && prod.stock <= parseInt(filtros[3]));
					}
				} else {
          return this.PRODUCTS;
				}
			}
		} catch (err) {
			return false;
		}
	}

	async update(id, data) {
		const prodID = parseInt(id);
		// Chequeo que item del array tiene el mismo ID para seleccionarlo
		let index;
		for (let i = 0; i < this.PRODUCTS.length; i++) {
			if (this.PRODUCTS[i].id === prodID) {
				index = i;
				break;
			}
		}
		// Si el item existe lo reenmplazo.
		// Al product que recibo desde el body le agrego el ID correspondiente y lo grabo
		if (index != undefined) {
			data.codigo = parseInt(data.codigo);
			data.precio = parseInt(data.precio);
			data.stock = parseInt(data.stock);
			data.id = prodID;
			data.timestamp = Date.now();
			this.PRODUCTS[index] = data;
			return data;
		}
	}

	async delete(id) {
		const prodID = parseInt(id);
		// Chequeo que item del array tiene el mismo ID para seleccionarlo
		let index;
		for (let i = 0; i < this.PRODUCTS.length; i++) {
			if (this.PRODUCTS[i].id === prodID) {
				index = i;
				break;
			}
		}
		// Si el item existe lo elimino del array.
		if (index != undefined) {
			const product = this.PRODUCTS[index];
			this.PRODUCTS.splice(index, 1);

      // LLamo a la funcion para borrar el producto del carrito
      fetch(`${URL_BASE}/api/carrito/borrar/${id}`, {
        method: 'DELETE',
      });
			return product;
		}
	}

}