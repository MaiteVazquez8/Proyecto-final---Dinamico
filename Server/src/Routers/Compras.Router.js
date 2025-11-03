const express = require('express');
const rutas = express.Router();

const {agregarAlCarrito, verCarrito, eliminarDelCarrito, darMeGusta, meGustaAlCarrito, comentarProducto, calificarProducto, realizarCompra, verComprasClientes} = require('../Controllers/Compras.Controller');

//CARRITO
rutas.post('/carrito', agregarAlCarrito);
rutas.get('/carrito/:DNI', verCarrito);
rutas.delete('/carrito/:ID_Carrito', eliminarDelCarrito);

//ME GUSTA
rutas.post('/me-gusta', darMeGusta);
rutas.post('/me-gusta-al-carrito', meGustaAlCarrito);

//COMENTARIOS
rutas.post('/comentario', comentarProducto);            

//CALIFICACIONES
rutas.post('/calificacion', calificarProducto);         

//COMPRAS
rutas.post('/compra', realizarCompra);
rutas.get('/compras/:DNI', verComprasClientes);

module.exports = rutas;