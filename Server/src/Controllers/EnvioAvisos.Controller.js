// src/Controllers/EnvioAvisos.Controller.js
const db = require('../DataBase/db');
const { enviarAvisoMail } = require('../Utils/mailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.JWT_SECRET || 'secret';

// Nota: idealmente usar middleware de auth que parsee y valide el token y ponga req.user.
// Este controlador hace una verificación rápida para no romperte rutas actuales.

const enviarAvisoPersonal = (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ Error: 'Token requerido.' });
  const token = authHeader.split(' ')[1];

  let emisor;
  try {
    emisor = jwt.verify(token, SECRET); // emisor: { DNI, rol, ... }
  } catch (Error) {
    return res.status(401).json({ Error: 'Token inválido o expirado.' });
  }

  const { destinatarioDNI, mensaje, asunto } = req.body;
  if (!mensaje || !asunto) return res.status(400).json({ Error: 'Falta mensaje o asunto.' });

  if (emisor.rol === 'superAdmin') {
    if (destinatarioDNI) {
      enviarMailEspecifico(destinatarioDNI, asunto, mensaje, res);
    } else {
      enviarMailMasivoATodoPersonal(asunto, mensaje, res);
    }
  } else if (emisor.rol === 'gerente') {
    if (destinatarioDNI) {
      verificarYEnviarAEmpleado(destinatarioDNI, asunto, mensaje, res);
    } else {
      enviarMailMasivoSoloEmpleados(asunto, mensaje, res);
    }
  } else {
    return res.status(403).json({ Error: 'Su rol no permite enviar avisos.' });
  }
};

// helpers
function enviarMailEspecifico(DNI, asunto, mensaje, res) {
  db.get(`SELECT Mail FROM Personal WHERE DNI = ?`, [DNI], (Error, row) => {
    if (Error || !row) return res.status(404).json({ Error: 'Destinatario no encontrado.' });
    enviarAvisoMail(row.Mail, asunto, mensaje).then(() => res.json({ Mensaje: `Aviso enviado a DNI ${DNI}.` })).catch(e => {
      console.error('enviarMailEspecifico send:', e);
      res.status(500).json({ Error: 'Error al enviar mail.' });
    });
  });
}

function verificarYEnviarAEmpleado(destinatarioDNI, asunto, mensaje, res) {
  db.get(`SELECT Mail, Rol FROM Personal WHERE DNI = ?`, [destinatarioDNI], (Error, row) => {
    if (Error || !row) return res.status(404).json({ Error: 'Destinatario no encontrado.' });
    if (!row.Rol || row.Rol.toLowerCase() !== 'empleado') return res.status(403).json({ Error: 'Solo se puede enviar a empleados.' });
    enviarAvisoMail(row.Mail, asunto, mensaje).then(() => res.json({ Mensaje: `Aviso enviado a empleado DNI ${destinatarioDNI}.` })).catch(e => {
      console.error('verificarYEnviarAEmpleado send:', e);
      res.status(500).json({ Error: 'Error al enviar mail.' });
    });
  });
}

function enviarMailMasivoATodoPersonal(asunto, mensaje, res) {
  db.all(`SELECT Mail FROM Personal WHERE Mail IS NOT NULL`, [], (Error, rows) => {
    if (Error) {
      console.error('enviarMailMasivoATodoPersonal select:', Error);
      return res.status(500).json({ Error: 'Error al obtener mails del personal.' });
    }
    const mails = rows.map(r => r.Mail);
    enviarAvisoMail(mails, asunto, mensaje).then(() => res.json({ Mensaje: 'Aviso masivo enviado a todo el personal.' })).catch(e => {
      console.error('enviarMailMasivoATodoPersonal send:', e);
      res.status(500).json({ Error: 'Error al enviar mails.' });
    });
  });
}

function enviarMailMasivoSoloEmpleados(asunto, mensaje, res) {
  db.all(`SELECT Mail FROM Personal WHERE LOWER(Rol) = 'empleado' AND Mail IS NOT NULL`, [], (Error, rows) => {
    if (Error) {
      console.error('enviarMailMasivoSoloEmpleados select:', Error);
      return res.status(500).json({ Error: 'Error al obtener mails de empleados.' });
    }
    const mails = rows.map(r => r.Mail);
    enviarAvisoMail(mails, asunto, mensaje).then(() => res.json({ Mensaje: 'Aviso masivo enviado a empleados.' })).catch(e => {
      console.error('enviarMailMasivoSoloEmpleados send:', e);
      res.status(500).json({ Error: 'Error al enviar mails.' });
    });
  });
}

module.exports = {
  enviarAvisoPersonal
};