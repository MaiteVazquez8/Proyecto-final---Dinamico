const sqlite=require('sqlite3')
const path=require('path')

const dbUbicacion=path.resolve(__dirname,'./Sistema.db')

const db=new sqlite.Database(dbUbicacion,(Error)=>{
    if(Error){
        console.log('Error en: ',Error)
    }
    else{
        console.log('Base de datos creada correctamente.')
        db.run(
            `
            CREATE TABLE IF NOT EXISTS Usuarios(
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT UNIQUE,
                Password TEXT,
                Name TEXT
            )`,(Error)=>{
                if(Error){
                console.log('La tabla usuarios no se pudo crear.')
            }
            else{
                console.log('Tabla Usuarios creada correctamente')
            }
        })
    }
})

module.exports=db