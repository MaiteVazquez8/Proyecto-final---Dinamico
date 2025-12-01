// src/Controllers/Login.Controller.js

const db = require('../DataBase/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { encriptarPassword, compararPassword } = require('../Utils/hash');
const { generarAccessToken, generarRefreshToken, generarTokenUnico } = require('../Utils/token');
const { enviarCorreoValidacion, enviarAvisoMail } = require('../Utils/mailer');

const SECRET = process.env.JWT_SECRET || 'secret';

// -----------------------------------------------------------
// 🔐 LOGIN UNIFICADO (Personal + Cliente)
// -----------------------------------------------------------
const login = (req, res) => {
    try {
        const { DNI, Email, Password } = req.body;
        console.log('Login attempt:', { DNI, Email });

        // Permitir login con DNI o Email
        const identifier = DNI || Email;

        if (!identifier || !Password) {
            console.log('Missing identifier or password');
            return res.status(400).json({ Error: 'Usuario (DNI/Email) y Password son obligatorios.' });
        }

        // 1. Buscar en Personal (Adaptado a schema: Contraseña, Cargo, Sin Verificado)
        // Asumimos Verificado = 1 porque la columna no existe en la DB actual
        const queryPersonal = `
          SELECT DNI, Nombre, Apellido, Mail, Contraseña AS Password, Cargo AS Rol, 1 AS Verificado, token_2fa, doble_factor_enabled
          FROM Personal
          WHERE DNI = ? OR Mail = ?
        `;

        db.get(queryPersonal, [identifier, identifier], async (Error, personal) => {
            if (Error) {
                console.error('Login Personal DB Error:', Error);
                return res.status(500).json({ Error: 'Error interno en base de datos (Personal).' });
            }

            if (personal) {
                console.log('User found in Personal:', personal.DNI);
                return procesarLogin(res, personal, Password);
            }

            // 2. Si no está en Personal, buscar en Cliente
            const queryCliente = `
              SELECT DNI, Nombre, Apellido, Mail, Contraseña AS Password, validacion AS Verificado, token_2fa, doble_factor_enabled
              FROM Cliente
              WHERE DNI = ? OR Mail = ?
            `;

            db.get(queryCliente, [identifier, identifier], async (Error, cliente) => {
                if (Error) {
                    console.error('Login Cliente DB Error:', Error);
                    return res.status(500).json({ Error: 'Error interno en base de datos (Cliente).' });
                }

                if (cliente) {
                    console.log('User found in Cliente:', cliente.DNI);
                    // Normalizar datos de cliente
                    cliente.Rol = 'cliente';
                    return procesarLogin(res, cliente, Password);
                }

                console.log('User not found in either table');
                return res.status(404).json({ Error: 'Usuario no encontrado.' });
            });
        });
    } catch (e) {
        console.error('Unexpected error in login:', e);
        return res.status(500).json({ Error: 'Error inesperado en el servidor.' });
    }
};

// Función auxiliar para procesar el login (común para Personal y Cliente)
const procesarLogin = async (res, user, passwordInput) => {
    try {
        // Verifico correo validado
        if (!user.Verificado) {
            console.log('User not verified');
            return res.status(403).json({ Error: 'Debes validar tu correo para iniciar sesión.' });
        }

        if (!user.Password) {
            console.error('User has no password hash');
            return res.status(500).json({ Error: 'Error de datos de usuario.' });
        }

        // Comparar contraseña
        console.log('Comparing password...');
        const coincide = await compararPassword(passwordInput, user.Password);
        if (!coincide) {
            console.log('Password mismatch');
            return res.status(401).json({ Error: 'Contraseña incorrecta.' });
        }

        // Si tiene 2FA activo enviamos código
        if (user.doble_factor_enabled) {
            console.log('2FA enabled');
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            const timestamp = Date.now();
            const fullCode = `${codigo}|${timestamp}`;

            const tabla = user.Rol === 'cliente' ? 'Cliente' : 'Personal';

            db.run(
                `UPDATE ${tabla} SET token_2fa = ? WHERE DNI = ?`,
                [fullCode, user.DNI],
                (Error) => {
                    if (Error) {
                        console.error('login update token_2fa error:', Error);
                    }
                }
            );

            enviarAvisoMail(user.Mail, 'Código de verificación 2FA', `Tu código es: ${codigo}`);

            return res.json({
                Mensaje: 'Código 2FA enviado al correo.',
                requiere2FA: true,
                DNI: user.DNI
            });
        }

        // Si NO hay 2FA → emitir tokens
        console.log('Generating tokens...');
        const access = generarAccessToken({ DNI: user.DNI, rol: user.Rol });
        const refresh = generarRefreshToken({ DNI: user.DNI, rol: user.Rol });

        return res.json({
            accessToken: access,
            refreshToken: refresh,
            rol: user.Rol,
            // Datos adicionales para el frontend
            Nombre: user.Nombre,
            Apellido: user.Apellido,
            Mail: user.Mail,
            Cargo: user.Rol, // El frontend espera 'Cargo'
            DNI: user.DNI
        });
    } catch (e) {
        console.error('Error in procesarLogin:', e);
        return res.status(500).json({ Error: 'Error al procesar el inicio de sesión.' });
    }
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
      SELECT DNI, Cargo AS Rol, token_2fa 
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
        async (Error) => {
            if (Error) {
                console.error('registrarCliente:', Error);

                // Manejo específico de DNI duplicado
                if (Error.code === 'SQLITE_CONSTRAINT' && Error.message.includes('DNI')) {
                    return res.status(400).json({ Error: 'El DNI ya está registrado. Por favor usa otro DNI.' });
                }

                return res.status(500).json({ Error: 'Error al registrar cliente.' });
            }

            // Intentar enviar email de validación (no crítico)
            console.log(`Enviando email de validación a ${Mail} con token: ${token}`);
            try {
                await enviarCorreoValidacion(Mail, Nombre, token);
                console.log('✓ Email de validación enviado exitosamente');
            } catch (emailError) {
                console.error('✗ Error al enviar email de validación:', emailError.message);
                console.error('Stack:', emailError.stack);
                // No fallar el registro si el email falla
            }

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
    // const token = generarTokenUnico(24); // Eliminado porque no existe columna

    // Adaptado a schema: Contraseña, Cargo, Sin Verificado/Token
    db.run(
        `INSERT INTO Personal (DNI, Nombre, Apellido, Mail, Contraseña, Cargo)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [DNI, Nombre, Apellido, Mail, hash, Rol],
        (Error) => {
            if (Error) {
                console.error('registrarPersonal:', Error);
                return res.status(500).json({ Error: 'Error al registrar personal.' });
            }

            // enviarValidacionMail(Mail, token); // Deshabilitado
            res.json({ Mensaje: 'Personal registrado correctamente.' });
        }
    );
};

const modificarPersonal = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Apellido, Mail, Password, Rol } = req.body;

    let hash = null;
    if (Password) hash = await encriptarPassword(Password);

    // Adaptado a schema: Contraseña, Cargo
    db.run(
        `UPDATE Personal SET
           Nombre = COALESCE(?, Nombre),
           Apellido = COALESCE(?, Apellido),
           Mail = COALESCE(?, Mail),
           Contraseña = COALESCE(?, Contraseña),
           Cargo = COALESCE(?, Cargo)
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
    // Adaptado a schema: Cargo
    db.all(`SELECT * FROM Personal WHERE Cargo = 'empleado'`, [], (Error, rows) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener empleados.' });
        res.json(rows);
    });
};

const obtenerGerentes = (req, res) => {
    // Adaptado a schema: Cargo
    db.all(`SELECT * FROM Personal WHERE Cargo = 'gerente'`, [], (Error, rows) => {
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