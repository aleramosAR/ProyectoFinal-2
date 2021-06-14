import knex from 'knex';
import fetch from "node-fetch";
import tempData from '../../utils/tempData.js';
import { URL_BASE, CONFIG_SQLITE } from '../../config.js';

export default class Productos {
  constructor() {
    this.knex = knex(CONFIG_SQLITE);

    (async () => {
      try {
        await this.crearTabla();
        console.log('Tabla en SQLITE3 de "Productos" creada');
      } catch (err) {
        console.log(err);
      }
    })();
  }

  async crearTabla() {
    return this.knex.schema.dropTableIfExists('productos')
      .then(() => {
        return this.knex.schema.createTable('productos', table => {
          table.increments('id').primary();
          table.string('nombre', 50).notNullable();
          table.string('descripcion', 100).notNullable();
          table.integer('codigo').notNullable();
          table.string('foto').notNullable();
          table.integer('precio').notNullable();
          table.integer('stock').notNullable();
          table.string('timestamp').notNullable();
        }).then(async() => {

          // Agrego datos temporales
          tempData.map(async(item) => {
            await this.knex('productos').insert([item]);
          });

        });
    })
  }

  async create(data) {
    if (data.nombre === "" || typeof data.nombre === "undefined") return false;
    if (data.precio === "" || typeof data.precio === "undefined") return false;
    if (data.foto === "" || typeof data.foto === "undefined") return false;

    data.timestamp = new Date();
    
    return await this.knex('productos').insert(data);
  }

  async read(id, filtros = null) {
    try {
			if (id) {
				// Devuelvo resultado si hago una busqueda por ID
				return await this.knex('productos').where({ id: id }).first();
			} else {
				let snap;
				if (filtros != null) {
					switch(filtros[0]) {
						case "nombre":
              snap = await this.knex('productos').where({ nombre: filtros[1] }).select();
						break;
						case "codigo":
              snap = await this.knex('productos').where({ codigo: filtros[1] }).select();
						break;
						case "premin":
              snap = await this.knex('productos').whereBetween('precio', [parseInt(filtros[2]), parseInt(filtros[3])]).select();
						break;
						case "stkmin":
              snap = await this.knex('productos').whereBetween('stock', [parseInt(filtros[2]), parseInt(filtros[3])]).select();
						break;
					}
				} else {
          snap = await this.knex('productos').select();
				}
				return (snap.length > 0) ? snap : false;
			}
		} catch (err) {
			return false;
		}
  }

  async update(id, data) {
    const existe = await this.knex('productos').where({ id: id });
    if (existe.length) {
      await this.knex('productos').where({ id: id }).update(data);
      return data;
    }
    return false;
  }

  async delete(id) {
    fetch(`${URL_BASE}/api/carrito/borrar/${id}`, {
      method: 'DELETE',
    });
    return await this.knex.from('productos').where('id', id).del();
  }

}