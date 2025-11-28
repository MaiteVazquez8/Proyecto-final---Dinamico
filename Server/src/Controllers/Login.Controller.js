const db = require('../DataBase/db');
const jwt = require('jsonwebtoken');
const { encriptarPassword, compararPassword } = require('../Utils/hash');

// =========================
// GENERAR TOKENS
// =========================

const generarAccessToken = (usuario, rol) => {
    return jwt.sign(
        { DNI: usuario.DNI, Rol: rol },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};

const generarRefreshToken = (usuario, rol) => {
    return jwt.sign(
        { DNI: usuario.DNI, Rol: rol },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// =========================
// LOGIN
// =========================

const login = (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    // BUSCAR EN CLIENTE
    const queryCliente = `SELECT * FROM Cliente WHERE Email = ?`;

    db.get(queryCliente, [Email], async (Error, cliente) => {
        if (Error) {
            return res.status(500).json({ mensaje: 'Error en la base de datos', Error });
        }

        if (cliente) {
            const valido = await compararPassword(Password, cliente.Password);

            if (!valido) {
                return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
            }

            const accessToken = generarAccessToken(cliente, 'cliente');
            const refreshToken = generarRefreshToken(cliente, 'cliente');

            const updateToken = `
                UPDATE Cliente 
                SET Token = ?
                WHERE DNI = ?
            `;

            db.run(updateToken, [refreshToken, cliente.DNI], (Error) => {
                if (Error) {
                    return res.status(500).json({ mensaje: 'Error al guardar refresh token', Error });
                }

                return res.json({
                    mensaje: 'Login exitoso (cliente)',
                    usuario: {
                        DNI: cliente.DNI,
                        Nombre: cliente.Nombre,
                        Email: cliente.Email,
                        Rol: 'cliente'
                    },
                    accessToken,
                    refreshToken
                });
            });

        } else {
            // BUSCAR EN PERSONAL
            const queryPersonal = `SELECT * FROM Personal WHERE Email = ?`;

            db.get(queryPersonal, [Email], async (Error, personal) => {
                if (Error) {
                    return res.status(500).json({ mensaje: 'Error en la base de datos', Error });
                }

                if (!personal) {
                    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
                }

                const valido = await compararPassword(Password, personal.Password);

                if (!valido) {
                    return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
                }

                const accessToken = generarAccessToken(personal, personal.Rol);
                const refreshToken = generarRefreshToken(personal, personal.Rol);

                const updateToken = `
                    UPDATE Personal 
                    SET Token = ?
                    WHERE DNI = ?
                `;

                db.run(updateToken, [refreshToken, personal.DNI], (Error) => {
                    if (Error) {
                        return res.status(500).json({ mensaje: 'Error al guardar refresh token', Error });
                    }

                    return res.json({
                        mensaje: 'Login exitoso (personal)',
                        usuario: {
                            DNI: personal.DNI,
                            Nombre: personal.Nombre,
                            Email: personal.Email,
                            Rol: personal.Rol
                        },
                        accessToken,
                        refreshToken
                    });
                });
            });
        }
    });
};

// =========================
// REFRESH TOKEN
// =========================

const refreshToken = (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(401).json({ mensaje: 'Refresh token requerido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (Error, usuario) => {
        if (Error) {
            return res.status(403).json({ mensaje: 'Refresh token inválido' });
        }

        const queryCliente = `SELECT * FROM Cliente WHERE DNI = ? AND Token = ?`;
        const queryPersonal = `SELECT * FROM Personal WHERE DNI = ? AND Token = ?`;

        db.get(queryCliente, [usuario.DNI, token], (Error, cliente) => {
            if (Error) return res.status(500).json({ mensaje: 'Error DB', Error });

            if (cliente) {
                const newAccessToken = generarAccessToken(cliente, 'cliente');
                return res.json({ accessToken: newAccessToken });
            }

            db.get(queryPersonal, [usuario.DNI, token], (Error, personal) => {
                if (Error) return res.status(500).json({ mensaje: 'Error DB', Error });

                if (!personal) {
                    return res.status(403).json({ mensaje: 'Token no válido' });
                }

                const newAccessToken = generarAccessToken(personal, personal.Rol);
                return res.json({ accessToken: newAccessToken });
            });
        });
    });
};

// =========================
// CLIENTES
// =========================

const registrarCliente = async (req, res) => {
    const { DNI, Nombre, Email, Password } = req.body;

    if (!DNI || !Nombre || !Email || !Password) {
        return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const hash = await encriptarPassword(Password);

    const query = `
        INSERT INTO Cliente (DNI, Nombre, Email, Password)
        VALUES (?, ?, ?, ?)
    `;

    db.run(query, [DNI, Nombre, Email, hash], function (Error) {
        if (Error) {
            return res.status(500).json({ mensaje: 'Error al registrar cliente', Error });
        }
        res.json({ mensaje: 'Cliente registrado correctamente' });
    });
};

const modificarCliente = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Email, Password } = req.body;

    let hash = null;
    if (Password) hash = await encriptarPassword(Password);

    const query = `
        UPDATE Cliente SET
        Nombre = COALESCE(?, Nombre),
        Email = COALESCE(?, Email),
        Password = COALESCE(?, Password)
        WHERE DNI = ?
    `;

    db.run(query, [Nombre, Email, hash, DNI], (Error) => {
        if (Error) {
            return res.status(500).json({ mensaje: 'Error al modificar cliente', Error });
        }
        res.json({ mensaje: 'Cliente actualizado' });
    });
};

const eliminarCliente = (req, res) => {
    const { DNI } = req.params;

    db.run(`DELETE FROM Cliente WHERE DNI = ?`, [DNI], (Error) => {
        if (Error) {
            return res.status(500).json({ mensaje: 'Error al eliminar cliente', Error });
        }
        res.json({ mensaje: 'Cliente eliminado' });
    });
};

// =========================
// PERSONAL
// =========================

const registrarPersonal = async (req, res) => {
    const { DNI, Nombre, Email, Password, Rol } = req.body;

    if (!DNI || !Nombre || !Email || !Password || !Rol) {
        return res.status(400).json({ mensaje: 'Campos obligatorios faltantes' });
    }

    const hash = await encriptarPassword(Password);

    const query = `
        INSERT INTO Personal (DNI, Nombre, Email, Password, Rol)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(query, [DNI, Nombre, Email, hash, Rol], (Error) => {
        if (Error) {
            return res.status(500).json({ mensaje: 'Error al registrar personal', Error });
        }
        res.json({ mensaje: 'Personal registrado correctamente' });
    });
};

const modificarPersonal = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Email, Password, Rol } = req.body;

    let hash = null;
    if (Password) hash = await encriptarPassword(Password);

    const query = `
        UPDATE Personal SET
        Nombre = COALESCE(?, Nombre),
        Email = COALESCE(?, Email),
        Password = COALESCE(?, Password),
        Rol = COALESCE(?, Rol)
        WHERE DNI = ?
    `;

    db.run(query, [Nombre, Email, hash, Rol, DNI], (Error) => {
        if (Error) {
            return res.status(500).json({ mensaje: 'Error al modificar personal', Error });
        }
        res.json({ mensaje: 'Personal actualizado' });
    });
};

const eliminarPersonal = (req, res) => {
    const { DNI } = req.params;

    db.run(`DELETE FROM Personal WHERE DNI = ?`, [DNI], (Error) => {
        if (Error) {
            return res.status(500).json({ mensaje: 'Error al eliminar personal', Error });
        }
        res.json({ mensaje: 'Personal eliminado' });
    });
};

// =========================
// VISTAS
// =========================

const obtenerClientes = (req, res) => {
    db.all(`SELECT DNI, Nombre, Email FROM Cliente`, [], (Error, filas) => {
        if (Error) return res.status(500).json({ Error });
        res.json(filas);
    });
};

const obtenerEmpleados = (req, res) => {
    db.all(`SELECT DNI, Nombre, Email FROM Personal WHERE Rol = 'empleado'`, [], (Error, filas) => {
        if (Error) return res.status(500).json({ Error });
        res.json(filas);
    });
};

const obtenerGerentes = (req, res) => {
    db.all(`SELECT DNI, Nombre, Email FROM Personal WHERE Rol = 'gerente'`, [], (Error, filas) => {
        if (Error) return res.status(500).json({ Error });
        res.json(filas);
    });
};

// =========================

module.exports = {
    login,
    refreshToken,
    registrarCliente,
    modificarCliente,
    eliminarCliente,
    registrarPersonal,
    modificarPersonal,
    eliminarPersonal,
    obtenerClientes,
    obtenerEmpleados,
    obtenerGerentes
};