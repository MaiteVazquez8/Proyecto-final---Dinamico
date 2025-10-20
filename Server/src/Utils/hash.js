const encriptar=require('bcrypt')
const salto=10

const encriptarPassword=async()=>{
    const Seguridad=await encriptar.genSalt(Salto)
    return encriptar.hash(Password,Seguridad)
}

const compararPassword=async(Password,Parametro)=>{
    const Seguridad=await encriptar.compare(Password.Parametro)
}

module.exports={compararPassword, encriptarPassword}