import fetch from "node-fetch";
import admin from "firebase-admin";
import { URL_BASE } from '../../config.js';

export default class Productos {
	constructor() {
		this.db = admin.firestore();
		this.queryRef = this.db.collection('productos');
	}

	async create(data) {
		if (data.nombre === '' || typeof data.nombre === 'undefined') return false;
		if (data.precio === '' || typeof data.precio === 'undefined') return false;
		if (data.foto === '' || typeof data.foto === 'undefined') return false;
		try {
			return await this.queryRef.add({
				nombre: data.nombre,
				descripcion: data.descripcion,
				codigo: parseInt(data.codigo),
				foto: data.foto,
				precio: parseInt(data.precio),
				stock: parseInt(data.stock),
				timestamp: Date.now(),
			});
		} catch (err) {
			return false;
		}
	}

	async read(id, filtros = null) {
		try {
			if(id) {
				// Devuelvo resultado si hago una busqueda por ID
				const doc = await this.queryRef.doc(id).get();
				return doc.data();
			} else {
				// Devuelvo resultado de todos los items
				let snap;
				// Reviso si hay filtros en la busqueda
				if (filtros != null) {
					switch(filtros[0]) {
						case "nombre":
							snap = await this.queryRef.where("nombre", "==", filtros[1]).get();
						break;
						case "codigo":
							snap = await this.queryRef.where("codigo", "==", parseInt(filtros[1])).get();
						break;
						case "premin":
							snap = await this.queryRef
								.where("precio", ">=", parseInt(filtros[2]))
								.where("precio", "<=", parseInt(filtros[3]))
								.get();
						break;
						case "stkmin":
							snap = await this.queryRef
								.where("stock", ">=", parseInt(filtros[2]))
								.where("stock", "<=", parseInt(filtros[3]))
								.get();
						break;
					}
				} else {
					// Si no hay filtros devuelvo todos los items.
					snap = await this.queryRef.get();
				}

				if (snap.empty) return false;
				const response = snap.docs.map((doc) => ({
					id: doc.id,
					nombre: doc.data().nombre,
					codigo: doc.data().codigo,
					descripcion: doc.data().descripcion,
					foto: doc.data().foto,
					precio: doc.data().precio,
					stock: doc.data().stock,
					timestamp: doc.data().timestamp,
				}));
				return response;

			}
		} catch (err) {
			return false;
		}
	}

	async update(id, data) {
		try {
			data.stock = parseInt(data.stock);
			data.precio = parseInt(data.precio);
			data.codigo = parseInt(data.codigo);
			await this.queryRef.doc(id).update(data);
			return data;
		} catch (err) {
			return false;
		}
	}

	async delete(id) {
		try {
			const doc = this.queryRef.doc(id);
			const item = await doc.delete({exists:true});

			fetch(`${URL_BASE}/api/carrito/borrar/${id}`, {
				method: 'DELETE',
			});
			return item;
		} catch (err) {
			return false;
		}
	}

}