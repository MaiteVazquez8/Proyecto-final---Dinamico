const express = require('express');
const rutas = express.Router();

const {registrarProducto, modificarProducto, eliminarProducto, registrarProveedor, modificarProveedor, eliminarProveedor, obtenerProductos, obtenerProveedores} = require('../Controllers/Productos.Controller');

//PRODUCTOS
rutas.get('/productos', obtenerProductos);
rutas.post('/productos', registrarProducto);
rutas.put('/productos/:ID_Producto', modificarProducto);

// Middleware para limpiar el ID antes de la eliminación
rutas.delete('/productos/:ID_Producto', (req, res, next) => {
    // Limpiar el ID si tiene formato extraño
    if (req.params.ID_Producto && typeof req.params.ID_Producto === 'string') {
        let cleanId = req.params.ID_Producto.trim();
        if (cleanId.includes(':')) {
            cleanId = cleanId.split(':')[0].trim();
            console.log(`ID limpiado en router: ${req.params.ID_Producto} -> ${cleanId}`);
        }
        req.params.ID_Producto = cleanId;
    }
    next();
}, eliminarProducto);

//PROVEEDORES
rutas.get('/proveedor', obtenerProveedores);
rutas.post('/proveedor', registrarProveedor);
rutas.put('/proveedor/:ID_Proveedor', modificarProveedor);
rutas.delete('/proveedor/:ID_Proveedor', eliminarProveedor);

module.exports = rutas;