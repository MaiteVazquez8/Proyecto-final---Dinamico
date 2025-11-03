const express = require('express');
const cors = require('cors');

const App = express();

require('dotenv').config();
const PORT = process.env.PORT || 5000;

App.use(express.json());
App.use(cors());

const loginRouter = require('./src/Routers/Login.Router');
const productosRouter = require('./src/Routers/Productos.Router');
const comprasRouter = require('./src/Routers/Compras.Router');

App.use('/api', loginRouter);
App.use('/api/productos', productosRouter);
App.use('/api/compras', comprasRouter);

App.listen(PORT, () => {
    console.log(`✅ Servidor activo en: http://localhost:${PORT}`);
});