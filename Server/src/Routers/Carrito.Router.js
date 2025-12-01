// src/Routers/Carrito.Router.js
const express = require('express');
const rutas = express.Router();

const {
  agregarAlCarrito,
  verCarrito,
  eliminarDelCarrito
} = require('../Controllers/Carrito.Controller');

// ================================
// CARRITO
// ================================

// Agregar producto al carrito
rutas.post('/agregar', agregarAlCarrito);

// Ver carrito por DNI
rutas.get('/:DNI', verCarrito);

// Eliminar ítem del carrito por ID_Carrito
rutas.delete('/eliminar/:ID_Carrito', eliminarDelCarrito);

module.exports = rutas;