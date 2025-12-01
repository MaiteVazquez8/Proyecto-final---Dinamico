// src/Routers/Calificaciones.Router.js
const express = require('express');
const router = express.Router();

// Controlador
const {
  obtenerCalificaciones,
  crearCalificacion,
  editarCalificacion,
  eliminarCalificacion,
  obtenerPromedioPorProducto
} = require('../Controllers/Calificaciones.Controller');

// Rutas ----------------------------

// Todas las calificaciones
router.get('/', obtenerCalificaciones);

// Crear calificación
router.post('/', crearCalificacion);

// Editar calificación
router.put('/:ID_Calificacion', editarCalificacion);

// Eliminar calificación
router.delete('/:ID_Calificacion', eliminarCalificacion);

// Obtener promedio por producto
router.get('/promedio/:ID_Producto', obtenerPromedioPorProducto);

module.exports = router;