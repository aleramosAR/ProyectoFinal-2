import CarritoMemory from "./memory/Carrito.js";
import CarritoFS from "./fs/Carrito.js";
import CarritoMysqlLocal from "./mysql-local/Carrito.js";
import CarritoSqlite3 from "./sqlite3/Carrito.js";
import CarritoMongoDB from "./mongodb/Carrito.js";
import CarritoFirebase from "./firebase/Carrito.js";

export default class CarritoFactory {
  constructor(baseType) {
    this.baseType = baseType;
  }

  getBase() {
    switch (this.baseType) {
      case 0:
        return new CarritoMemory();
      case 1:
        return new CarritoFS();
      case 2:
        return new CarritoMysqlLocal();
      // case 3:
      //   return CarritoMysqlDBAAS;
      case 4:
        return new CarritoSqlite3();
      case 5:
      case 6:
        return new CarritoMongoDB();
      case 7:
        return new CarritoFirebase();
      default:
        return new CarritoMemory();
    }
    
  }
}