import fetch from "node-fetch";
import mongoose from 'mongoose';
import tempData from '../../utils/tempData.js';
import { URL_BASE } from '../../config.js';

export default class Productos {
	constructor() {
		const Schema = mongoose.Schema;
		const productosSchema = new Schema({
			nombre: String,
			descripcion: String,
			codigo: Number,
			foto: String,
			precio: Number,
			stock: Number,
			timestamp: String,
		});
		// Opcion para que MongoDB devuelva _id como parte del objeto bajo el parametro id
		// Necesario para que funcione igual que el resto de las opciones de base.
		productosSchema.virtual('id').get(function(){ return this._id.toHexString(); });
		productosSchema.set('toJSON', { virtuals: true });

		this.productosModel = mongoose.model('producto', productosSchema);

		// Agrego datos temporales
		mongoose.connection.dropCollection('productos');
		tempData.map(async(item) => {
			const newProducto = new this.productosModel({
				nombre: item.nombre,
				descripcion: item.descripcion,
				codigo: item.codigo,
				foto: item.foto,
				precio: item.precio,
				stock: item.stock,
				timestamp: Date.now(),
			});
			await newProducto.save();
		});
	}

	async create(data) {
		if (data.nombre === '' || typeof data.nombre === 'undefined') return false;
		if (data.precio === '' || typeof data.precio === 'undefined') return false;
		if (data.foto === '' || typeof data.foto === 'undefined') return false;

		const newProducto = new this.productosModel({
			nombre: data.nombre,
			descripcion: data.descripcion,
			codigo: data.codigo,
			foto: data.foto,
			precio: data.precio,
			stock: data.stock,
			timestamp: Date.now(),
		});
		
		await newProducto.save();
		return true;
	}

	async read(id, filtros = null) {
		try {
			if (id) {
				// Devuelvo resultado si hago una busqueda por ID
				const prod = await this.productosModel.findOne({ _id: id });
				return prod ? prod : false;
				
			} else {
				let snap;
				if (filtros != null) {
					switch(filtros[0]) {
						case "nombre":
							snap = await this.productosModel.find({ nombre: filtros[1] });
						break;
						case "codigo":
							snap = await this.productosModel.find({ codigo: parseInt(filtros[1]) });
						break;
						case "premin":
							snap = await this.productosModel.find({ precio: {$gte: parseInt(filtros[2]), $lte: parseInt(filtros[3])} });
						break;
						case "stkmin":
							snap = await this.productosModel.find({ stock: {$gte: parseInt(filtros[2]), $lte: parseInt(filtros[3])} });
						break;
					}
				} else {
					snap = await this.productosModel.find();
				}
				return (snap.length > 0) ? snap : false;
			}
		} catch (err) {
			return false;
		}
	}

	async update(id, data) {
		data.timestamp = Date.now();
		await this.productosModel.updateOne({ _id: id }, data);
		return data;
	}

	async delete(id) {
		try {
			const res = await this.productosModel.deleteOne({ _id: id });
			if (res.n) {
				// LLamo a la funcion para borrar el producto del carrito
				fetch(`${URL_BASE}/api/carrito/borrar/${id}`, {
					method: 'DELETE',
				});
				return JSON.stringify(res);
			}
			return false;
		} catch (err) {
			return false;
		}
	}

}