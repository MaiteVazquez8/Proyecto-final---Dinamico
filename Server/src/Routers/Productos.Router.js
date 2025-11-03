const express = require('express');
const rutas = express.Router();

const {registrarProducto, modificarProducto, eliminarProducto, registrarProveedor, modificarProveedor, eliminarProveedor} = require('../Controllers/Productos.Controller');

//PRODUCTOS
rutas.post('/productos', registrarProducto);
rutas.put('/productos/:ID_Producto', modificarProducto);
rutas.delete('/productos/:ID_Producto', eliminarProducto);

//PROVEEDORES
rutas.post('/proveedor', registrarProveedor);
rutas.put('/proveedor/:ID_Proveedor', modificarProveedor);
rutas.delete('/proveedor/:ID_Proveedor', eliminarProveedor);

module.exports = rutas;