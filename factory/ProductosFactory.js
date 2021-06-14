import productosMemory from "./memory/Productos.js";
import productosFS from "./fs/Productos.js";
import productosMysqlLocal from "./mysql-local/Productos.js";
import productosSqlite3 from "./sqlite3/Productos.js";
import productosMongoDB from "./mongodb/Productos.js";
import productosFirebase from "./firebase/Productos.js";

export default class ProductosFactory {
  constructor(baseType) {
    this.baseType = baseType;
  }

  getBase() {
    switch (this.baseType) {
      case 0:
        return new productosMemory();
      case 1:
        return new productosFS();
      case 2:
        return new productosMysqlLocal();
      // case 3:
      //   return productosMysqlDBAAS;
      case 4:
        return new productosSqlite3();
      case 5:
      case 6:
        return new productosMongoDB();
      case 7:
        return new productosFirebase();
      default:
        return new productosMemory();
    }
    
  }
}