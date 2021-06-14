import mongoose from "mongoose";
import admin from "firebase-admin";
import fs from 'fs';

export const PORT = process.env.PORT || 8080;
export const URL_BASE = `http://localhost:${PORT}`;
export const ADMIN = true;
export const BASE_TYPE = 0;

export const CONFIG_MYSQL = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecommerce'
  }
}

export const CONFIG_SQLITE = {
  client: 'sqlite3',
  connection: { filename: './dbs/sqlite/ecommerce.sqlite3' },
  useNullAsDefault: true
}

export const configMongo = async(db) => {
  const database = (db === 'local') ?
    "mongodb://localhost/ecommerce" :
    "mongodb+srv://ale:ale@cluster0.xdmbo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

  await mongoose.connect(database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  });
}

const firebaseINIT = false;

export const configFirebase = async() => {

  if (!firebaseINIT) {
    try {
      const data = await fs.promises.readFile("./utils/firebaseAccount.json");
      const serviceAccount = JSON.parse(data);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Base FIREBASE inicializada.");
    } catch(err) {
      return err;
    }
  }
  
}

// Nros de referencia para BASE_TYPE
// 0  Memoria
// 1  File System (fs)
// 2  MySQL/MariaDB local
// 3  MySQL/MariaDB DBaaS
// 4  SQLite3
// 5  MongoDB Local
// 6  MongoDB DBaaS
// 7  Firebase