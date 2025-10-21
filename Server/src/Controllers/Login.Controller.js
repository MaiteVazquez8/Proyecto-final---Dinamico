const db=require('../DataBase/db')

const {compararPassword,encriptarPassword}=require('../Utils/hash')

const registroUsuario=async(req,res)=>{
    const{user,Password,Name}=req.body
    if(!user||!Password||!Name){
        console.error('Campos vacíos')
        return res.status(404).json({Error:'Debe completar los datos para continuar.'})
    }

    query='SELECT*FROM Usuarios WHERE user=?'

    db.get(query,[user], async(Error,Tabla)=>{
        if(Error){
            console.error('Error en La consulta: ',Error)
            return res.status(500).json({Error:'Error en Server o Query.'})
        }
        if(Tabla){
            console.log('Usuario existente.')
            return res.status(201).json({Error:'Usuario existente.'})
        }
    })

    const hash=await encriptarPassword(Password)

    const query2='INSERT INTO Usuarios(user,Password,Name) VALUES (?,?,?)'

    db.run(query2,[user,hash,Name],(Error)=>{
        if(Error){
            console.log('Error en La consulta: ',Error)
            return res.status(500).json({Error:'Error en Server o Query.'})
        }
        else{
            return res.status(201).json({
                mensaje:'Usuario registrado.',
                Id:this.lasteID,
                user
            })
        }
    })
}

const Login=(req,res)=>{
    
    const {user,Password}=req.body

    const query='SELECT * FROM Usuarios WHERE user=?'
    db.get(query,[User], async(Error,Tabla)=>{
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

        const hashed= await compararPassword(Password,Tabla.Password)

        res.json({
            mensaje:'Bienvenido',
            user
        })
    })
}

module.exports={registroUsuario,Login}