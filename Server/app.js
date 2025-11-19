const express=require('express')
const cors=require('cors')

const App=express()

require('dotenv').config()
const PORT=process.env.PORT||5000

// Configurar CORS para permitir solicitudes desde el cliente
App.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Aumentar el límite de tamaño del body para aceptar imágenes en base64
App.use(express.json({ limit: '50mb' }))
App.use(express.urlencoded({ limit: '50mb', extended: true }))

const loginRouter = require('./src/Routers/Login.Router');
const productosRouter = require('./src/Routers/Productos.Router');
const comprasRouter = require('./src/Routers/Compras.Router');

// Ruta de health check
App.get('/api', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

App.use('/api', loginRouter);
App.use('/api/productos', productosRouter);
App.use('/api/compras', comprasRouter);

App.listen(PORT,()=>{
    console.log(`Servidor: http://localhost:${PORT}`)
})