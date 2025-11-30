// src/Controllers/Login.Controller.js

const db = require('../DataBase/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { encriptarPassword, compararPassword } = require('../Utils/hash');
const { generarAccessToken, generarRefreshToken, generarTokenUnico } = require('../Utils/token');
const { enviarValidacionMail, enviarAvisoMail } = require('../Utils/mailer');

const SECRET = process.env.JWT_SECRET || 'secret';

// -----------------------------------------------------------
// 🔐 LOGIN UNIFICADO (Personal + Cliente)
// -----------------------------------------------------------
const login = (req, res) => {
    const { DNI, Password } = req.body;
    if (!DNI || !Password) {
        return res.status(400).json({ Error: 'DNI y Password son obligatorios.' });
    }

    const query = `
      SELECT DNI, Nombre, Apellido, Mail, Password, Rol, Verificado, token_2fa, doble_factor_enabled
      FROM Personal
      WHERE DNI = ?
      UNION
      SELECT DNI, Nombre, Apellido, Mail, Contraseña AS Password, 'cliente' AS Rol, validacion AS Verificado, token_2fa, doble_factor_enabled
      FROM Cliente
      WHERE DNI = ?
    `;

    db.get(query, [DNI, DNI], async (Error, user) => {
        if (Error) {
            console.error('login select:', Error);
            return res.status(500).json({ Error: 'Error interno.' });
        }
        if (!user) return res.status(404).json({ Error: 'Usuario no encontrado.' });

        // Verifico correo validado
        if (!user.Verificado) {
            return res.status(403).json({ Error: 'Debes validar tu correo para iniciar sesión.' });
        }

        // Comparar contraseña
        const coincide = await compararPassword(Password, user.Password);
        if (!coincide) {
            return res.status(401).json({ Error: 'Contraseña incorrecta.' });
        }

        // Si tiene 2FA activo enviamos código
        if (user.doble_factor_enabled) {
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            const timestamp = Date.now();
            const fullCode = `${codigo}|${timestamp}`;

            const tabla = user.Rol === 'cliente' ? 'Cliente' : 'Personal';

            db.run(
                `UPDATE ${tabla} SET token_2fa = ? WHERE DNI = ?`,
                [fullCode, DNI],
                (Error) => {
                    if (Error) {
                        console.error('login update token_2fa:', Error);
                    }
                }
            );

            enviarAvisoMail(user.Mail, 'Código de verificación 2FA', `Tu código es: ${codigo}`);

            return res.json({
                Mensaje: 'Código 2FA enviado al correo.',
                requiere2FA: true,
                DNI
            });
        }

        // Si NO hay 2FA → emitir tokens
        const access = generarAccessToken({ DNI: user.DNI, rol: user.Rol });
        const refresh = generarRefreshToken({ DNI: user.DNI, rol: user.Rol });

        return res.json({
            accessToken: access,
            refreshToken: refresh,
            rol: user.Rol
        });
    });
};

// -----------------------------------------------------------
// 🔑 CONFIRMAR CÓDIGO 2FA
// -----------------------------------------------------------
const confirmar2FA = (req, res) => {
    const { DNI, codigo } = req.body;
    if (!DNI || !codigo) {
        return res.status(400).json({ Error: 'DNI y código requeridos.' });
    }

    const query = `
      SELECT DNI, Rol, token_2fa 
      FROM Personal WHERE DNI = ?
      UNION
      SELECT DNI, 'cliente' AS Rol, token_2fa 
      FROM Cliente WHERE DNI = ?
    `;

    db.get(query, [DNI, DNI], (Error, user) => {
        if (Error) {
            console.error('confirmar2FA select:', Error);
            return res.status(500).json({ Error: 'Error interno.' });
        }
        if (!user || !user.token_2fa) {
            return res.status(404).json({ Error: 'Código no encontrado.' });
        }

        const [storedCode, timestamp] = user.token_2fa.split('|');
        const ahora = Date.now();

        // Expira en 5 minutos
        if (ahora - parseInt(timestamp) > 5 * 60 * 1000) {
            return res.status(401).json({ Error: 'El código expiró.' });
        }

        if (codigo !== storedCode) {
            return res.status(401).json({ Error: 'Código incorrecto.' });
        }

        // Limpio el token 2FA
        const tabla = user.Rol === 'cliente' ? 'Cliente' : 'Personal';
        db.run(`UPDATE ${tabla} SET token_2fa = NULL WHERE DNI = ?`, [DNI]);

        // Emitir tokens
        const access = generarAccessToken({ DNI, rol: user.Rol });
        const refresh = generarRefreshToken({ DNI, rol: user.Rol });

        res.json({
            Mensaje: '2FA verificado correctamente.',
            accessToken: access,
            refreshToken: refresh,
            rol: user.Rol
        });
    });
};

// -----------------------------------------------------------
// 🔄 REFRESH TOKEN
// -----------------------------------------------------------
const refreshToken = (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ Error: 'Token requerido.' });

    jwt.verify(token, SECRET, (Error, user) => {
        if (Error) return res.status(403).json({ Error: 'Token inválido.' });

        const access = generarAccessToken({ DNI: user.DNI, rol: user.rol });
        res.json({ accessToken: access });
    });
};

// -----------------------------------------------------------
// 📩 ENVIAR TOKEN DE VALIDACIÓN POR CORREO
// -----------------------------------------------------------
const enviarTokenValidacion = (req, res) => {
    const { DNI, Mail } = req.body;
    if (!DNI || !Mail) return res.status(400).json({ Error: 'DNI y Mail requeridos.' });

    const token = generarTokenUnico(24);

    db.run(
        `UPDATE Cliente SET token_validacion = ? WHERE DNI = ?`,
        [token, DNI],
        (Error) => {
            if (Error) {
                console.error('enviarTokenValidacion update:', Error);
                return res.status(500).json({ Error: 'Error interno.' });
            }

            enviarValidacionMail(Mail, token);
            res.json({ Mensaje: 'Token de validación enviado.' });
        }
    );
};

// -----------------------------------------------------------
// 📧 VALIDAR CORREO
// -----------------------------------------------------------
const validarCorreo = (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ Error: 'Token requerido.' });

    db.get(
        `SELECT DNI FROM Cliente WHERE token_validacion = ?`,
        [token],
        (Error, row) => {
            if (Error) {
                console.error('validarCorreo select:', Error);
                return res.status(500).json({ Error: 'Error interno.' });
            }
            if (!row) return res.status(400).json({ Error: 'Token inválido.' });

            db.run(
                `UPDATE Cliente SET validacion = 1, token_validacion = NULL WHERE DNI = ?`,
                [row.DNI],
                (Error) => {
                    if (Error) return res.status(500).json({ Error: 'Error al validar correo.' });
                    res.json({ Mensaje: 'Correo validado correctamente.' });
                }
            );
        }
    );
};

// -----------------------------------------------------------
// 👤 REGISTRO / MODIFICACIÓN / ELIMINACIÓN — CLIENTE
// -----------------------------------------------------------
const registrarCliente = async (req, res) => {
    const { DNI, Nombre, Apellido, Mail, Contraseña } = req.body;

    if (!DNI || !Nombre || !Mail || !Contraseña) {
        return res.status(400).json({ Error: 'Faltan datos obligatorios.' });
    }

    const hash = await encriptarPassword(Contraseña);
    const token = generarTokenUnico(24);

    db.run(
        `INSERT INTO Cliente (DNI, Nombre, Apellido, Mail, Contraseña, validacion, token_validacion) 
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [DNI, Nombre, Apellido, Mail, hash, token],
        (Error) => {
            if (Error) {
                console.error('registrarCliente:', Error);
                return res.status(500).json({ Error: 'Error al registrar cliente.' });
            }

            enviarValidacionMail(Mail, token);
            res.json({ Mensaje: 'Cliente registrado. Revisa tu correo para validar la cuenta.' });
        }
    );
};

const modificarCliente = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Apellido, Mail, Contraseña } = req.body;

    let hash = null;
    if (Contraseña) hash = await encriptarPassword(Contraseña);

    db.run(
        `UPDATE Cliente SET 
           Nombre = COALESCE(?, Nombre),
           Apellido = COALESCE(?, Apellido),
           Mail = COALESCE(?, Mail),
           Contraseña = COALESCE(?, Contraseña)
         WHERE DNI = ?`,
        [Nombre, Apellido, Mail, hash, DNI],
        function (Error) {
            if (Error) {
                console.error('modificarCliente:', Error);
                return res.status(500).json({ Error: 'Error al modificar cliente.' });
            }
            if (this.changes === 0) return res.status(404).json({ Error: 'Cliente no encontrado.' });

            res.json({ Mensaje: 'Cliente actualizado.' });
        }
    );
};

const eliminarCliente = (req, res) => {
    const { DNI } = req.params;

    db.run(`DELETE FROM Cliente WHERE DNI = ?`, [DNI], function (Error) {
        if (Error) return res.status(500).json({ Error: 'Error al eliminar cliente.' });
        if (this.changes === 0) return res.status(404).json({ Error: 'Cliente no encontrado.' });
        res.json({ Mensaje: 'Cliente eliminado.' });
    });
};

// -----------------------------------------------------------
// 👷 PERSONAL (superAdmin → gerente → empleado)
// -----------------------------------------------------------
const registrarPersonal = async (req, res) => {
    const { DNI, Nombre, Apellido, Mail, Password, Rol } = req.body;

    if (!DNI || !Nombre || !Mail || !Password || !Rol) {
        return res.status(400).json({ Error: 'Faltan datos obligatorios.' });
    }

    const hash = await encriptarPassword(Password);
    const token = generarTokenUnico(24);

    db.run(
        `INSERT INTO Personal (DNI, Nombre, Apellido, Mail, Password, Rol, Verificado, token_validacion)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
        [DNI, Nombre, Apellido, Mail, hash, Rol, token],
        (Error) => {
            if (Error) {
                console.error('registrarPersonal:', Error);
                return res.status(500).json({ Error: 'Error al registrar personal.' });
            }

            enviarValidacionMail(Mail, token);
            res.json({ Mensaje: 'Personal registrado. Debe validar su correo.' });
        }
    );
};

const modificarPersonal = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Apellido, Mail, Password, Rol } = req.body;

    let hash = null;
    if (Password) hash = await encriptarPassword(Password);

    db.run(
        `UPDATE Personal SET
           Nombre = COALESCE(?, Nombre),
           Apellido = COALESCE(?, Apellido),
           Mail = COALESCE(?, Mail),
           Password = COALESCE(?, Password),
           Rol = COALESCE(?, Rol)
         WHERE DNI = ?`,
        [Nombre, Apellido, Mail, hash, Rol, DNI],
        function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al modificar personal.' });
            if (this.changes === 0) return res.status(404).json({ Error: 'Personal no encontrado.' });

            res.json({ Mensaje: 'Personal actualizado correctamente.' });
        }
    );
};

const eliminarPersonal = (req, res) => {
    const { DNI } = req.params;

    db.run(`DELETE FROM Personal WHERE DNI = ?`, [DNI], function (Error) {
        if (Error) return res.status(500).json({ Error: 'Error al eliminar personal.' });
        if (this.changes === 0) return res.status(404).json({ Error: 'Personal no encontrado.' });
        res.json({ Mensaje: 'Personal eliminado.' });
    });
};

// -----------------------------------------------------------
// 📄 LISTAR USUARIOS
// -----------------------------------------------------------
const obtenerEmpleados = (req, res) => {
    db.all(`SELECT * FROM Personal WHERE Rol = 'empleado'`, [], (Error, rows) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener empleados.' });
        res.json(rows);
    });
};

const obtenerGerentes = (req, res) => {
    db.all(`SELECT * FROM Personal WHERE Rol = 'gerente'`, [], (Error, rows) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener gerentes.' });
        res.json(rows);
    });
};

const obtenerClientes = (req, res) => {
    db.all(`SELECT * FROM Cliente`, [], (Error, rows) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener clientes.' });
        res.json(rows);
    });
};

// -----------------------------------------------------------
// EXPORTAR
// -----------------------------------------------------------
module.exports = {
    login,
    confirmar2FA,
    refreshToken,
    enviarTokenValidacion,
    validarCorreo,

    registrarCliente,
    modificarCliente,
    eliminarCliente,

    registrarPersonal,
    modificarPersonal,
    eliminarPersonal,

    obtenerEmpleados,
    obtenerGerentes,
    obtenerClientes
};