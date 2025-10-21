const express=require('express')
const rutas=express.Router()
const {Login,registroUsuario}=require ('../Controllers/Login.Controller')

rutas.post('/Login',Login)
rutas.post('/registroUsuario',registroUsuario)

module.exports=rutas