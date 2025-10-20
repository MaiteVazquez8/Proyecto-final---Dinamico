const db=require('../DataBase/db')

const {compararPassword,encriptarPassword}=require('../Utils/hash')

const Login=async(req,res)=>{
    
    const {user,Password}=req.body

    const query='SELECT * FROM Usuarios WHERE user=?'
    db.get(query,[User],(Error,Tabla)=>{
        if(Error){
            console.error('Error en Server.')
            return res.status(500).json({Error:'Error en Server o Query.'})
        }
        if(Tabla){
            console.log('Usuario existente.')
            return res.status(201).json({Error:'Usuario existente.'})
        }
        if(!user){
            console.error('Campos vacíos.')
            return res.status(404).json({Error:'Campos vacíos.'})
        }

        const hashed=compararPassword(Password,Tabla.Password)
    })
}