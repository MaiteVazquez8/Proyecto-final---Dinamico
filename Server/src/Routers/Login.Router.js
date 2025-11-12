const express=require('express')
const rutas=express.Router()

const {login, registrarCliente, modificarCliente, eliminarCliente, registrarPersonal, modificarPersonal, eliminarPersonal, obtenerEmpleados, obtenerGerentes, obtenerPersonal, obtenerClientePorDNI} = require('../Controllers/Login.Controller');

//LOGIN
rutas.post('/Login', login);

// CLIENTE
rutas.post('/registrarCliente', registrarCliente);
rutas.put('/modificarCliente/:DNI', modificarCliente);
rutas.delete('/eliminarCliente/:DNI', eliminarCliente);
rutas.get('/cliente/:DNI', obtenerClientePorDNI);

// PERSONAL
rutas.post('/registrarPersonal', registrarPersonal);
rutas.put('/modificarPersonal/:DNI', modificarPersonal);
rutas.delete('/eliminarPersonal/:DNI', eliminarPersonal);
rutas.get('/empleados', obtenerEmpleados);
rutas.get('/gerentes', obtenerGerentes);
rutas.get('/personal', obtenerPersonal);

module.exports = rutas;