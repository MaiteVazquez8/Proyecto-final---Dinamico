<<<<<<< HEAD
const express = require('express')
const rutas = express.Router()

const {login, registrarCliente, modificarCliente, eliminarCliente, registrarPersonal, modificarPersonal, eliminarPersonal, obtenerEmpleados, obtenerGerentes, obtenerClientes} = require('../Controllers/Login.Controller');

// LOGIN
=======
const express=require('express')
const rutas=express.Router()

const {login, registrarCliente, modificarCliente, eliminarCliente, registrarPersonal, modificarPersonal, eliminarPersonal, obtenerEmpleados, obtenerGerentes, obtenerPersonal, obtenerClientePorDNI} = require('../Controllers/Login.Controller');

//LOGIN
>>>>>>> 24a5ef904fc1194a2c9611fbfc8f73d7d3643bef
rutas.post('/Login', login);

// CLIENTE
rutas.post('/registrarCliente', registrarCliente);
rutas.put('/modificarCliente/:DNI', modificarCliente);
rutas.delete('/eliminarCliente/:DNI', eliminarCliente);
<<<<<<< HEAD
=======
rutas.get('/cliente/:DNI', obtenerClientePorDNI);
>>>>>>> 24a5ef904fc1194a2c9611fbfc8f73d7d3643bef

// PERSONAL
rutas.post('/registrarPersonal', registrarPersonal);
rutas.put('/modificarPersonal/:DNI', modificarPersonal);
rutas.delete('/eliminarPersonal/:DNI', eliminarPersonal);
<<<<<<< HEAD

// VISTAS
rutas.get('/clientes', obtenerClientes); 
rutas.get('/empleados', obtenerEmpleados); 
rutas.get('/gerentes', obtenerGerentes);
=======
rutas.get('/empleados', obtenerEmpleados);
rutas.get('/gerentes', obtenerGerentes);
rutas.get('/personal', obtenerPersonal);
>>>>>>> 24a5ef904fc1194a2c9611fbfc8f73d7d3643bef

module.exports = rutas;