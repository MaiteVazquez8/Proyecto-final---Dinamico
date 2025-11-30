// src/Routers/Login.Router.js
const express = require('express');
const router = express.Router();

const {
  login,
  loginPersonal,
  validarCuenta,
  reenviarValidacion,
  solicitarRecuperacion,
  recuperarPassword,
  verificar2FA,
  generarNuevo2FA
} = require('../Controllers/Login.Controller');

// --- LOGIN GENERAL CLIENTES ---
router.post('/login', login);

// --- LOGIN PERSONAL (superAdmin, gerente, empleado) ---
router.post('/login-personal', loginPersonal);

// --- VALIDACIÓN DE CUENTA POR MAIL ---
router.get('/validar/:token', validarCuenta);

// --- REENVIAR TOKEN DE VALIDACIÓN ---
router.post('/reenviar-validacion', reenviarValidacion);

// --- RECUPERAR CONTRASEÑA ---
router.post('/recuperacion', solicitarRecuperacion);
router.post('/recuperar-password/:token', recuperarPassword);

// --- VERIFICACIÓN 2 FACTORES ---
router.post('/2fa/verificar', verificar2FA);

// --- SOLICITAR NUEVO CÓDIGO 2FA ---
router.post('/2fa/generar', generarNuevo2FA);

module.exports = router;