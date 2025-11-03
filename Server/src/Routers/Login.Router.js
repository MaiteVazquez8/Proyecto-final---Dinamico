const express=require('express')
const rutas=express.Router()
const {Login,registroUsuario}=require ('../Controllers/Login.Controller')

<<<<<<< HEAD
rutas.post('/Login',Login)
rutas.post('/registroUsuario',registroUsuario)

module.exports=rutas
=======
const {login, registrarCliente, modificarCliente, eliminarCliente, registrarPersonal, modificarPersonal, eliminarPersonal} = require('../Controllers/Login.Controller');

//LOGIN
rutas.post('/Login', login);

// CLIENTE
rutas.post('/registrarCliente', registrarCliente);
rutas.put('/modificarCliente/:DNI', modificarCliente);
rutas.delete('/eliminarCliente/:DNI', eliminarCliente);

// PERSONAL
rutas.post('/registrarPersonal', registrarPersonal);
rutas.put('/modificarPersonal/:DNI', modificarPersonal);
rutas.delete('/eliminarPersonal/:DNI', eliminarPersonal);

module.exports = rutas;
>>>>>>> 468eaa0e96e6ad9a42600792efc56fa2b164132e
