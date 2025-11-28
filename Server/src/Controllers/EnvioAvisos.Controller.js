const db = require('../DataBase/db');
const { enviarAvisoMail } = require('../Utils/mailer');
const jwt = require('jsonwebtoken');

const enviarAvisoPersonal = (req, res) => {

    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ Error: 'Token requerido.' });
    }

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    let emisor;

    try {
        emisor = jwt.verify(token, process.env.JWT_SECRET);
        // emisor debe contener: { DNI, rol }
    } catch (Error) {
        return res.status(401).json({ Error: 'Token inválido o expirado.' });
    }

    const { destinatarioDNI, mensaje, asunto } = req.body;

    if (!mensaje || !asunto) {
        return res.status(400).json({ Error: 'Falta mensaje o asunto.' });
    }

    if (emisor.rol === 'superAdmin') {

        if (destinatarioDNI) {
            enviarMailEspecifico(destinatarioDNI, asunto, mensaje, res);
        } else {
            enviarMailMasivoATodosMenosClientes(asunto, mensaje, res);
        }

    } else if (emisor.rol === 'gerente') {

        if (destinatarioDNI) {
            verificarYEnviarAEmpleado(destinatarioDNI, asunto, mensaje, res);
        } else {
            enviarMailMasivoSoloEmpleados(asunto, mensaje, res);
        }

    } else {
        res.status(403).json({ Error: 'Su rol no permite enviar avisos.' });
    }
};


// --------- FUNCIONES AUXILIARES ---------

function enviarMailEspecifico(DNI, asunto, mensaje, res) {
    db.get('SELECT Mail FROM Personal WHERE DNI = ?', [DNI], (Error, row) => {
        if (Error || !row) return res.status(404).json({ Error: 'Destinatario no encontrado.' });

        enviarAvisoMail(row.Mail, asunto, mensaje)
            .then(() => res.json({ Mensaje: `Aviso enviado a DNI ${DNI}.` }))
            .catch(() => res.status(500).json({ Error: 'Error al enviar mail específico.' }));
    });
}

function verificarYEnviarAEmpleado(destinatarioDNI, asunto, mensaje, res) {
    db.get('SELECT Mail, Cargo FROM Personal WHERE DNI = ?', [destinatarioDNI], (Error, row) => {

        if (Error || !row || row.Cargo !== 'Empleado') {
            return res.status(403).json({ Error: 'El gerente solo puede enviar avisos a empleados.' });
        }

        enviarAvisoMail(row.Mail, asunto, mensaje)
            .then(() => res.json({ Mensaje: `Aviso enviado a empleado DNI ${destinatarioDNI}.` }))
            .catch(() => res.status(500).json({ Error: 'Error al enviar mail.' }));
    });
}

function enviarMailMasivoATodosMenosClientes(asunto, mensaje, res) {
    db.all('SELECT Mail FROM Personal', [], (Error, rows) => {

        if (Error) return res.status(500).json({ Error: 'Error al obtener mails del personal.' });

        const mails = rows.map(r => r.Mail);

        enviarAvisoMail(mails, asunto, mensaje);
        res.json({ Mensaje: 'Aviso masivo enviado a todo el personal.' });
    });
}

function enviarMailMasivoSoloEmpleados(asunto, mensaje, res) {
    db.all('SELECT Mail FROM Personal WHERE Cargo = "Empleado"', [], (Error, rows) => {

        if (Error) return res.status(500).json({ Error: 'Error al obtener mails de empleados.' });

        const mails = rows.map(r => r.Mail);

        enviarAvisoMail(mails, asunto, mensaje);
        res.json({ Mensaje: 'Aviso masivo enviado a todos los empleados.' });
    });
}

module.exports = {
    enviarAvisoPersonal
};