// src/Routers/Login.Router.js
const express = require('express');
const router = express.Router();

const {
  login,
  confirmar2FA,
  refreshToken,
  enviarTokenValidacion,
  validarCorreo,
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

// --- AUTENTICACIÓN ---
router.post('/login', login);
router.post('/2fa/confirmar', confirmar2FA);
router.post('/refresh-token', refreshToken);

// --- VALIDACIÓN DE CORREO ---
router.post('/enviar-validacion', enviarTokenValidacion);
router.post('/validar-correo', validarCorreo);

// --- GESTIÓN DE CLIENTES ---
router.post('/clientes', registrarCliente);
router.put('/clientes/:DNI', modificarCliente);
router.delete('/clientes/:DNI', eliminarCliente);
router.get('/clientes', obtenerClientes);

// --- GESTIÓN DE PERSONAL (Empleados y Gerentes) ---
router.post('/personal', registrarPersonal);
router.put('/personal/:DNI', modificarPersonal);
router.delete('/personal/:DNI', eliminarPersonal);
router.get('/empleados', obtenerEmpleados);
router.get('/gerentes', obtenerGerentes);

module.exports = router;