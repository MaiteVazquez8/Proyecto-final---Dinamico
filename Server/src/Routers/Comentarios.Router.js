// src/Routers/Comentarios.Router.js
const express = require('express');
const rutas = express.Router();

const {
  obtenerComentariosPorProducto,
  crearComentario,
  editarComentario,
  eliminarComentario
} = require('../Controllers/Comentarios.Controller');

// =======================================
// COMENTARIOS
// =======================================

// Obtener comentarios de un producto
rutas.get('/:ID_Producto', obtenerComentariosPorProducto);

// Crear comentario
rutas.post('/crear', crearComentario);

// Editar comentario por ID
rutas.put('/editar/:ID_Comentario', editarComentario);

// Eliminar comentario por ID
rutas.delete('/eliminar/:ID_Comentario', eliminarComentario);

module.exports = rutas;