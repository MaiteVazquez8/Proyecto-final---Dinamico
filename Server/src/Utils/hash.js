const encriptar=require('bcrypt')
const salto=10

const encriptarPassword=async(Password)=>{
    const Seguridad=await encriptar.genSalt(salto)
    return encriptar.hash(Password,Seguridad)
}

const compararPassword=async(Password,Parametro)=>{
    return encriptar.compare(Password,Parametro)
}

module.exports={compararPassword, encriptarPassword}