const express = require('express');
const rutas = express.Router();

const {
    login,
    refreshToken,
    registrarCliente,
    modificarCliente,
    eliminarCliente,
    registrarPersonal,
    modificarPersonal,
    eliminarPersonal,
    obtenerEmpleados,
    obtenerGerentes,
    obtenerClientes
} = require('../Controllers/Login.Controller');

// =========================
// LOGIN Y TOKENS
// =========================
rutas.post('/login', login);
rutas.post('/refresh-token', refreshToken);

// =========================
// CLIENTE
// =========================
rutas.post('/registrarCliente', registrarCliente);
rutas.put('/modificarCliente/:DNI', modificarCliente);
rutas.delete('/eliminarCliente/:DNI', eliminarCliente);

// =========================
// PERSONAL
// =========================
rutas.post('/registrarPersonal', registrarPersonal);
rutas.put('/modificarPersonal/:DNI', modificarPersonal);
rutas.delete('/eliminarPersonal/:DNI', eliminarPersonal);

// =========================
// VISTAS
// =========================
rutas.get('/clientes', obtenerClientes);
rutas.get('/empleados', obtenerEmpleados);
rutas.get('/gerentes', obtenerGerentes);

module.exports = rutas;