const db = require('../DataBase/db');
const { compararPassword, encriptarPassword } = require('../Utils/hash');

const registroUsuario = async (req, res) => {
    const { user, Password, Name } = req.body;
    console.log(req.body);

    if (!user || !Password || !Name) {
        console.error('Campos vacíos');
        return res.status(404).json({ Error: 'Debe completar los datos para continuar.' });
    }

    const query = 'SELECT * FROM Usuarios WHERE user = ?';

    db.get(query, [user], async (Error, Tabla) => {
        if (Error) {
            console.error('Error en la consulta:', Error);
            return res.status(500).json({ Error: 'Error en Server o Query.' });
        }

        if (Tabla) {
            console.log('Usuario existente.');
            return res.status(400).json({ Error: 'Usuario existente.' });
        }

        const query2 = 'INSERT INTO Usuarios(user, Password, Name) VALUES (?, ?, ?)';
        const hash = await encriptarPassword(Password);

        db.run(query2, [user, hash, Name], function (Error) {
            if (Error) {
                console.error('Error en la inserción:', Error);
                return res.status(500).json({ Error: 'Error en Server o Query.' });
            } else {
                return res.status(201).json({
                    Mensaje: '✅ Usuario registrado correctamente.',
                    ID: this.lastID,
                    user
                });
            }
        });
    });
};

const Login = (req, res) => {
    const { user, Password } = req.body;

    if (!user || !Password) {
        console.error('Campos vacíos.');
        return res.status(404).json({ Error: 'Campos vacíos.' });
    }

    const query = 'SELECT * FROM Usuarios WHERE user = ?';
    db.get(query, [user], async (Error, Tabla) => {
        if (Error) {
            console.error('Error en Server:', Error);
            return res.status(500).json({ Error: 'Error en Server o Query.' });
        }

        if (!Tabla) {
            console.error('Usuario no encontrado.');
            return res.status(404).json({ Error: 'Usuario no encontrado.' });
        }

        const validPassword = await compararPassword(Password, Tabla.Password);

        if (!validPassword) {
            return res.status(401).json({ Error: 'Contraseña incorrecta.' });
        }

        res.json({
            Mensaje: '✅ Bienvenido',
            user
        });
    });
};

const VerUsuarios = (req, res) => {
    const query = 'SELECT ID, user, Name FROM Usuarios';
    
    db.all(query, [], (Error, Tabla) => {
        if (Error) {
            return res.status(500).json({ Error: '❗ Error en la carga de usuarios.' });
        } else {
            res.json(Tabla);
        }
    });
};

const EliminarUsuario = (req, res) => {
    const { ID } = req.params;
    const query = 'DELETE FROM Usuarios WHERE ID = ?';

    db.run(query, [ID], function (Error) {
        if (Error) {
            return res.status(500).json({ Error: '❗ Error al eliminar el usuario.' });
        } else {
            res.json({
                Mensaje: '✅ Usuario eliminado correctamente.',
                Cambios: this.changes
            });
        }
    });
};

const ModificarUsuario = (req, res) => {
    const { ID } = req.params;
    const { user, Name, Password } = req.body;

    if (!user || !Name) {
        return res.status(400).json({ Error: '❗ Faltan datos para modificar.' });
    }

    if (Password) {
        encriptarPassword(Password).then((hash) => {
            const query = 'UPDATE Usuarios SET user = ?, Name = ?, Password = ? WHERE ID = ?';
            db.run(query, [user, Name, hash, ID], function (Error) {
                if (Error) {
                    return res.status(500).json({ Error: '❗ Error al modificar el usuario.' });
                } else {
                    res.json({
                        Mensaje: '✅ Usuario modificado correctamente (con nueva contraseña).',
                        Cambios: this.changes
                    });
                }
            });
        });
    } else {
        const query = 'UPDATE Usuarios SET user = ?, Name = ? WHERE ID = ?';
        db.run(query, [user, Name, ID], function (Error) {
            if (Error) {
                return res.status(500).json({ Error: '❗ Error al modificar el usuario.' });
            } else {
                res.json({
                    Mensaje: '✅ Usuario modificado correctamente.',
                    Cambios: this.changes
                });
            }
        });
    }
};

module.exports = {
    registroUsuario,
    Login,
    VerUsuarios,
    EliminarUsuario,
    ModificarUsuario
};