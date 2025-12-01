// src/Routers/Compras.Router.js
const express = require('express');
const rutas = express.Router();

const {
  realizarCompra,
  verComprasClientes,
  obtenerTodasCompras,
  actualizarEstadoEnvio
} = require('../Controllers/Compras.Controller');

// ----------------------
//     COMPRAS
// ----------------------

// Realizar compra
rutas.post('/compra', realizarCompra);

// Ver compras de un cliente
rutas.get('/compras/:DNI', verComprasClientes);

// Admin: obtener todas las compras
rutas.get('/all', obtenerTodasCompras);

// Actualizar estado de envío
rutas.put('/estado/envio/:ID_Envio', actualizarEstadoEnvio);
rutas.put('/estado/compra/:ID_Compra', actualizarEstadoEnvio);

module.exports = rutas;