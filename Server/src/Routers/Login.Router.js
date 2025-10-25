const express = require('express');
const rutas = express.Router();

const {Login, registroUsuario, VerUsuarios, EliminarUsuario, ModificarUsuario} = require('../Controllers/Login.Controller');

rutas.post('/Login', Login);
rutas.post('/registroUsuario', registroUsuario);

rutas.get('/usuarios', VerUsuarios);
rutas.delete('/usuarios/:ID', EliminarUsuario);
rutas.put('/usuarios/:ID', ModificarUsuario);

module.exports = rutas;