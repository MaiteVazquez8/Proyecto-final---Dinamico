// app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const App = express();
const PORT = process.env.PORT || 5000;

/* -------------------------------------------
   CONFIGURACIÓN CORS
-------------------------------------------- */
App.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

/* -------------------------------------------
   BODY PARSER (Base64 para imágenes)
-------------------------------------------- */
App.use(express.json({ limit: '50mb' }));
App.use(express.urlencoded({ limit: '50mb', extended: true }));

/* -------------------------------------------
   IMPORTAR ROUTERS
-------------------------------------------- */
const loginRouter = require('./src/Routers/Login.Router');
const productosRouter = require('./src/Routers/Productos.Router');
const comprasRouter = require('./src/Routers/Compras.Router');
const carritoRouter = require('./src/Routers/Carrito.Router');
const comentariosRouter = require('./src/Routers/Comentarios.Router');
const calificacionesRouter = require('./src/Routers/Calificaciones.Router');
const meGustaRouter = require('./src/Routers/MeGusta.Router');
const avisosRouter = require('./src/Routers/EnvioAvisos.Router');

/* -------------------------------------------
   HEALTH CHECK
-------------------------------------------- */
App.get('/api', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

/* -------------------------------------------
   MONTAR ROUTERS
-------------------------------------------- */

// LOGIN / AUTH
App.use('/api/auth', loginRouter);

// PRODUCTOS Y PROVEEDORES
App.use('/api', productosRouter);

// COMPRAS
App.use('/api/compras', comprasRouter);

// CARRITO
App.use('/api/carrito', carritoRouter);

// COMENTARIOS
App.use('/api/comentarios', comentariosRouter);

// CALIFICACIONES
App.use('/api/calificaciones', calificacionesRouter);

// ME GUSTA
App.use('/api', meGustaRouter);

// AVISOS
App.use('/api/avisos', avisosRouter);

/* -------------------------------------------
   INICIAR SERVIDOR
-------------------------------------------- */
App.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en: http://localhost:${PORT}`);
});