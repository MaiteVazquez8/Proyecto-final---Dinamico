const express=require('express')
const cors=require('cors')

const App=express()

require('dotenv').config()
const PORT=process.env.PORT||5000

App.use(express.json())
App.use(cors())

<<<<<<< HEAD
const router=require('./src/Routers/Login.Router')
App.use('/api',router)
=======
const loginRouter = require('./src/Routers/Login.Router');
const productosRouter = require('./src/Routers/Productos.Router');
const comprasRouter = require('./src/Routers/Compras.Router');

App.use('/api', loginRouter);
App.use('/api/productos', productosRouter);
App.use('/api/compras', comprasRouter);
>>>>>>> 468eaa0e96e6ad9a42600792efc56fa2b164132e

App.listen(PORT,()=>{
    console.log(`Servidor: http://localhost:${PORT}`)
})