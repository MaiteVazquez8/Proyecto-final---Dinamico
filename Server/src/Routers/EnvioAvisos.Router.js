// src/Routers/EnvioAvisos.Router.js
const express = require('express');
const rutas = express.Router();

const { enviarAvisoPersonal } = require('../Controllers/EnvioAvisos.Controller');

rutas.post('/enviar-aviso', enviarAvisoPersonal);

module.exports = rutas;