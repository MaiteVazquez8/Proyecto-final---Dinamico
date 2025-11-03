const db=require('../DataBase/db')

//CLIENTE
const registrarCliente = async (req, res) => {
    const { DNI, Nombre, Apellido, Mail, Fecha_Nac, Contraseña, Cod_Postal, Telefono, Direccion } = req.body;

    if (!DNI || !Nombre || !Apellido || !Mail || !Contraseña) {
        console.error('Campos vacíos');
        return res.status(400).json({ Error: 'Debe completar los datos para continuar.' });
    }

    const query = 'SELECT * FROM Cliente WHERE DNI = ? OR Mail = ?';
    db.get(query, [DNI, Mail], async (Error, cliente) => {
        if (Error) {
            console.error('Error en la consulta:', Error);
            return res.status(500).json({ Error: 'Error en Server o Query.' });
        }

        if (cliente) {
            console.log('DNI o Mail de cliente ya registrado.');
            return res.status(400).json({ Error: 'DNI o Mail ya registrado.' });
        }

        const hash = await encriptarPassword(Contraseña);
        const queryInsert = `INSERT INTO Cliente(DNI, Nombre, Apellido, Mail, Fecha_Nac, Contraseña, Cod_Postal, Telefono, Direccion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(queryInsert, [DNI, Nombre, Apellido, Mail, Fecha_Nac, hash, Cod_Postal, Telefono, Direccion], function(Error) {
            if (Error) {
                console.error('Error al insertar cliente:', Error);
                return res.status(500).json({ Error: 'Error en Server o Query.' });
            } else {
                res.status(201).json({
                    Mensaje: 'Cliente registrado correctamente.',
                    DNI
                });
            }
        });
    });
};

const modificarCliente = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Apellido, Mail, Fecha_Nac, Contraseña, Cod_Postal, Telefono, Direccion } = req.body;

    if (!Nombre || !Apellido || !Mail) {
        return res.status(400).json({ Error: 'Faltan datos para modificar.' });
    }

    if (Contraseña) {
        const hash = await encriptarPassword(Contraseña);
        const query = `UPDATE Cliente SET Nombre = ?, Apellido = ?, Mail = ?, Fecha_Nac = ?, Contraseña = ?, Cod_Postal = ?, Telefono = ?, Direccion = ? WHERE DNI = ?`;
        db.run(query, [Nombre, Apellido, Mail, Fecha_Nac, hash, Cod_Postal, Telefono, Direccion, DNI], function(Error) {
            if (Error) {
                console.error('Error al modificar cliente:', Error);
                return res.status(500).json({ Error: 'Error en Server o Query.' });
            } else {
                res.json({ Mensaje: 'Cliente modificado correctamente.', Cambios: this.changes });
            }
        });
    } else {
        const query = `UPDATE Cliente SET Nombre = ?, Apellido = ?, Mail = ?, Fecha_Nac = ?, Cod_Postal = ?, Telefono = ?, Direccion = ? WHERE DNI = ?`;
        db.run(query, [Nombre, Apellido, Mail, Fecha_Nac, Cod_Postal, Telefono, Direccion, DNI], function(Error) {
            if (Error) {
                console.error('Error al modificar cliente:', Error);
                return res.status(500).json({ Error: 'Error en Server o Query.' });
            } else {
                res.json({ Mensaje: 'Cliente modificado correctamente.', Cambios: this.changes });
            }
        });
    }
};

const eliminarCliente = (req, res) => {
    const { DNI } = req.params;
    const query = 'DELETE FROM Cliente WHERE DNI = ?';

    db.run(query, [DNI], function(Error) {
        if (Error) {
            console.error('Error al eliminar cliente:', Error);
            return res.status(500).json({ Error: 'Error en Server o Query.' });
        } else {
            res.json({ Mensaje: 'Cliente eliminado correctamente.', Cambios: this.changes });
        }
    });
};

//PERSONAL
const registrarPersonal = async (req, res) => {
    const { DNI, Nombre, Apellido, Mail, Fecha_Nacimiento, Contraseña, Telefono, Direccion, Cargo } = req.body;

    if (!DNI || !Nombre || !Apellido || !Mail || !Contraseña || !Cargo) {
        console.error('Campos vacíos');
        return res.status(400).json({ Error: 'Debe completar los datos.' });
    }

    const query = 'SELECT * FROM Personal WHERE DNI = ? OR Mail = ?';
    db.get(query, [DNI, Mail], async (Error, personal) => {
        if (Error) {
            console.error('Error en la consulta:', Error);
            return res.status(500).json({ Error: 'Error en Server o Query.' });
        }

        if (personal) {
            console.log('DNI o Mail de personal ya registrado.');
            return res.status(400).json({ Error: 'DNI o Mail ya registrado.' });
        }

        const hash = await encriptarPassword(Contraseña);
        const queryInsert = `INSERT INTO Personal(DNI, Nombre, Apellido, Mail, Fecha_Nacimiento, Contraseña, Telefono, Direccion, Cargo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(queryInsert, [DNI, Nombre, Apellido, Mail, Fecha_Nacimiento, hash, Telefono, Direccion, Cargo], function(Error) {
            if (Error) {
                console.error('Error al insertar personal:', Error);
                return res.status(500).json({ Error: 'Error en Server o Query.' });
            } else {
                res.status(201).json({ Mensaje: 'Personal registrado correctamente.', DNI, Cargo });
            }
        });
    });
};

const modificarPersonal = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Apellido, Mail, Fecha_Nacimiento, Contraseña, Telefono, Direccion, Cargo } = req.body;

    if (!Nombre || !Apellido || !Mail || !Cargo) {
        return res.status(400).json({ Error: 'Faltan datos.' });
    }

    if (Contraseña) {
        const hash = await encriptarPassword(Contraseña);
        const query = `UPDATE Personal SET Nombre = ?, Apellido = ?, Mail = ?, Fecha_Nacimiento = ?, Contraseña = ?, Telefono = ?, Direccion = ?, Cargo = ? WHERE DNI = ?`;
        db.run(query, [Nombre, Apellido, Mail, Fecha_Nacimiento, hash, Telefono, Direccion, Cargo, DNI], function(Error) {
            if (Error) {
                console.error('Error al modificar personal:', Error);
                return res.status(500).json({ Error: 'Error en Server o Query.' });
            } else {
                res.json({ Mensaje: 'Personal modificado correctamente.', Cambios: this.changes });
            }
        });
    } else {
        const query = `UPDATE Personal SET Nombre = ?, Apellido = ?, Mail = ?, Fecha_Nacimiento = ?, Telefono = ?, Direccion = ?, Cargo = ? WHERE DNI = ?`;
        db.run(query, [Nombre, Apellido, Mail, Fecha_Nacimiento, Telefono, Direccion, Cargo, DNI], function(Error) {
            if (Error) {
                console.error('Error al modificar personal:', Error);
                return res.status(500).json({ Error: 'Error en Server o Query.' });
            } else {
                res.json({ Mensaje: 'Personal modificado correctamente.', Cambios: this.changes });
            }
        });
    }
};

const eliminarPersonal = (req, res) => {
    const { DNI } = req.params;
    const query = 'DELETE FROM Personal WHERE DNI = ?';

    db.run(query, [DNI], function(Error) {
        if (Error) {
            console.error('Error al eliminar personal:', Error);
            return res.status(500).json({ Error: 'Error en Server o Query.' });
        } else {
            res.json({ Mensaje: 'Personal eliminado correctamente.', Cambios: this.changes });
        }
    });
};

//LOGIN
const login = async (req, res) => {
    const { Mail, Contraseña } = req.body;

    if (!Mail || !Contraseña) {
        console.error('Campos vacíos');
        return res.status(400).json({ Error: 'Debe completar Mail y Contraseña.' });
    }

    db.get('SELECT * FROM Cliente WHERE Mail = ?', [Mail], async (Error, cliente) => {
        if (Error) {
            console.error('Error en Server:', Error);
            return res.status(500).json({ Error: 'Error en Server o Query.' });
        }

        if (cliente) {
            const validPassword = await compararPassword(Contraseña, cliente.Contraseña);
            if (!validPassword) {
                return res.status(401).json({ Error: 'Contraseña incorrecta.' });
            }

            return res.json({
                Mensaje: `Bienvenido ${cliente.Nombre}`,
                DNI: cliente.DNI,
                Nombre: cliente.Nombre,
                Cargo: 'cliente'
            });
        }

        db.get('SELECT * FROM Personal WHERE Mail = ?', [Mail], async (Error, personal) => {
            if (Error) {
                console.error('Error en Server:', Error);
                return res.status(500).json({ Error: 'Error en Server o Query.' });
            }

            if (!personal) {
                return res.status(404).json({ Error: 'Usuario no encontrado.' });
            }

            const validPassword = await compararPassword(Contraseña, personal.Contraseña);
            if (!validPassword) {
                return res.status(401).json({ Error: 'Contraseña incorrecta.' });
            }

            return res.json({
                Mensaje: `Bienvenido ${personal.Cargo} ${personal.Nombre}`,
                DNI: personal.DNI,
                Nombre: personal.Nombre,
                Cargo: personal.Cargo
            });
        });
    });
};

module.exports = {
    registrarCliente,
    modificarCliente,
    eliminarCliente,
    registrarPersonal,
    modificarPersonal,
    eliminarPersonal,
    login
};