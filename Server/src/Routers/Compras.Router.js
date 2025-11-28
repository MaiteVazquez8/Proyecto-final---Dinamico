const express = require('express');
const rutas = express.Router();

const {agregarAlCarrito, verCarrito, eliminarDelCarrito, darMeGusta, meGustaAlCarrito, obtenerComentarios, comentarProducto, calificarProducto, realizarCompra, verComprasClientes} = require('../Controllers/Compras.Controller');

//CARRITO
rutas.post('/carrito', agregarAlCarrito);
rutas.get('/carrito/:DNI', verCarrito);
rutas.delete('/carrito/:ID_Carrito', eliminarDelCarrito);

//ME GUSTA
rutas.post('/me-gusta', darMeGusta);
rutas.post('/me-gusta-al-carrito', meGustaAlCarrito);

//COMENTARIOS
rutas.get('/comentarios/:ID_Producto', obtenerComentarios);
rutas.post('/comentario', comentarProducto);            

//CALIFICACIONES
rutas.post('/calificacion', calificarProducto);         

//COMPRAS
rutas.post('/compra', realizarCompra);
rutas.get('/compras/:DNI', verComprasClientes);

// Admin: obtener todas las compras y actualizar estado de envío
rutas.get('/all', (req, res) => {
	// controlador agregado dinámicamente por Compras.Controller exports
	const { obtenerTodasCompras } = require('../Controllers/Compras.Controller');
	return obtenerTodasCompras(req, res);
});

rutas.put('/estado/:ID_Compra', (req, res) => {
	const { actualizarEstadoCompra } = require('../Controllers/Compras.Controller');
	return actualizarEstadoCompra(req, res);
});

module.exports = rutas;