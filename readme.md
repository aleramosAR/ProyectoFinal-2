# Proyecto final #2

En la carpeta /factory estan las subcarpetas con las clases DAO de cada tipo de base.
En la carpeta /dbs estan las carpetas de las bases fisicas que se usan en el proyecto la de /sqlite3 y la de /mongodb (version local), esta ultima carpeta esta vacia y se debe iniciar mongo antes de iniciar la app, ya que era muy pesada y no la subi.
No hice la opcion de MySQL DBaaS ya que no se hizo en clase, y por lo que comentaron no existe el servicio de MySQL DBaaS. Si elegis la opcion 3 que es esa va a mostrar la opcion por defecto cuando no hya opcion que es la 0 (Memoria).
Las 2 opciones de mongoDB usan la misma ya que las funcones son las mismas, solo cambia el tipo de conexion.
En estas 2 opciones de MongoDB agregue un script de conexion en server.js que se ejecuta antes que se inicia el socket para que la conexion este activa antes de levantar la aplicacion, si no daba error al hacer la carga inicial de productos.

Dentro de /factory se pueden encontrar los archivos **ProductosFactory.js** y **CarritoFactory.js** que levantan la clase perteneciente a cada tipo de base segun la opcion que se le envie.

En el Front End, debajo del encabezado agregue una franja verde donde se lee cual es el tipo de base en uso, para de esta manera saber cual se esta usando sin tener que revisar el codigo.


En algunas de las clases DAO inclui en el constructor un script para precargar productos, y no tener que estar recargandolos cada vez que se testee algun tipo de base. Por eso en algunas opciones puede pasar que al reiniciar la aplicacion vuelvan a aparecer esos productos en vez de los cambios que se hayan hecho, se puede comentar ese script para evitar que esto pase.

Cree un archivo config.js donde se pueden cambiar ciertos valores como rutas, puertos, configuraciones de bases, en este archivo se puede seleccionar el tipo de base a usar cambiando la variable **BASE_TYPE** con los siguientes valores:

```
0 - Memoria
1 - File System (fs)
2  - MySQL/MariaDB local
3  - MySQL/MariaDB DBaaS (NO FUE HECHO)
4  - SQLite3
5  - MongoDB Local
6  - MongoDB DBaaS
7  - Firebase
```
---

## Rutas

####Rutas de Front End

<table><tr><td>

**Listado de productos**
http://localhost:8080/productos

**Carrito**
http://localhost:8080/carrito

</td></tr></table>

---

####Rutas de Back End
######Estas funcionan por igual con todas las opciones de base.

<table><tr><td>

**Mostrar todos los productos**
GET http://localhost:8080/api/productos

**Mostrar un producto especifico**
GET http://localhost:8080/api/productos/:id

**Agregar un producto**
POST http://localhost:8080/api/productos

**Actualizar un producto**
PUT http://localhost:8080/api/productos/actualizar/:id

**Eliminar un producto**
DELETE http://localhost:8080/api/productos/borrar/:id

</td></tr></table>
<br />
<table><tr><td>

**Mostrar el carrito**
GET http://localhost:8080/api/carrito

**Mostrar solo los productos del carrito**
GET http://localhost:8080/api/carrito/productos

**Mostrar un producto del carrito**
GET http://localhost:8080/api/carrito/:id

**Agregar un producto del carrito**
POST http://localhost:8080/api/carrito/agregar/:id

**Eliminar un producto del carrito**
DELETE http://localhost:8080/api/carrito/borrar/:id

</td></tr></table>

---

## Filtros

En el Front End agregue un div donde estan los filtros, desde la botonera se pueden mostrar/ocultar los campos para ingresar el texto a filtrar segun el parametro que se quiera filtrar (nombre, codigo, precio o stock).

Tambien agregue un boton de "Quitar filtros" que resetea el filtro ingresado y muestra nuevamente todos los productos disponibles.

En caso de no encontrar productos que coincidan con la busqueda se muestra un cartel de "No hay productos que coincidan con su búsqueda."

---

## Glitch

Tambien subi una copia del sitio a glitch para que lo puedas ver online, ahi no se puede instalar la base local de "MySQL" ni de "MongoDB", creo que hay una opcion pero paga, asi que las opciones 2 y 5 no funcionaran en glitch, pero podes probar las otras.

**URL de Glitch**
https://circular-neon-zone.glitch.me/productos

**URL de Glitch para editar**
https://glitch.com/edit/#!/circular-neon-zone

Podes clickear en "Remix to Edit" y te va a crear una copia del sitio para poder editar en congig.js y probar los otros modos de base, recorda que el 2 y 5 no funcionaran en glitch y que el 3 no fue implementado porque no lo hicimos.