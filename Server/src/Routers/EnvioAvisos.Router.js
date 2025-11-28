const express = require('express');
const router = express.Router();

const { enviarAvisoPersonal } = require('../Controllers/EnvioAvisos.Controller');

router.post('/enviar-aviso', enviarAvisoPersonal);

module.exports = router;