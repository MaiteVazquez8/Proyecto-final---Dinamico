// src/Routers/MeGusta.Router.js
const express = require('express');
const router = express.Router();

const {
  darMeGusta,
  meGustaAlCarrito
} = require('../Controllers/MeGusta.Controller');

// Dar Me Gusta a un producto
router.post('/me-gusta', darMeGusta);

// Pasar todos los Me Gusta al carrito
router.post('/me-gusta-a-carrito', meGustaAlCarrito);

module.exports = router;