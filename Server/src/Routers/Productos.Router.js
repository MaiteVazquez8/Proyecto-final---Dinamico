// src/Routers/Productos.Router.js
const express = require('express');
const router = express.Router();

const {
  registrarProducto,
  modificarProducto,
  eliminarProducto,
  registrarProveedor,
  modificarProveedor,
  eliminarProveedor,
  obtenerProductos,
  obtenerProveedores,
  obtenerProductosDetallados,
  obtenerAlertasBajoStock
} = require('../Controllers/Productos.Controller');

/* ------------------ PRODUCTOS ------------------ */

// obtener todos los productos
router.get('/productos', obtenerProductos);

// obtener productos con calificaciones + comentarios + proveedor
router.get('/productos-detallados', obtenerProductosDetallados);

// registrar producto
router.post('/productos', registrarProducto);

// modificar producto
router.put('/productos/:ID_Producto', modificarProducto);

// eliminar producto
router.delete('/productos/:ID_Producto', eliminarProducto);

// alertas de stock bajo
router.get('/productos/alertas/stock', obtenerAlertasBajoStock);


/* ------------------ PROVEEDORES ------------------ */

// obtener todos los proveedores
router.get('/proveedores', obtenerProveedores);

// registrar proveedor
router.post('/proveedores', registrarProveedor);

// modificar proveedor
router.put('/proveedores/:ID_Proveedor', modificarProveedor);

// eliminar proveedor
router.delete('/proveedores/:ID_Proveedor', eliminarProveedor);


module.exports = router;
