const express = require('express');
const cors = require('cors');

const App = express();

require('dotenv').config();
const PORT = process.env.PORT || 5000;

App.use(express.json());
App.use(cors());

const router = require('./src/Routers/Login.Router');
App.use('/api', router);

App.listen(PORT, () => {
    console.log(`✅ Servidor activo en: http://localhost:${PORT}`);
});