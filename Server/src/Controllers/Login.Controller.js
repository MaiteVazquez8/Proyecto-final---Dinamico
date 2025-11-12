const db = require('../DataBase/db')
const { encriptarPassword, compararPassword } = require('../Utils/hash')

//Cliente
const registrarCliente = async (req, res) => {
    const { DNI, Nombre, Apellido, Mail, Fecha_Nac, Contraseña, Cod_Postal, Telefono, Direccion } = req.body;

    if (!DNI || !Nombre || !Apellido || !Mail || !Contraseña) {
        return res.status(400).json({ Error: 'Debe completar los datos para continuar.' });
    }

    const query = 'SELECT * FROM Cliente WHERE DNI = ?';
    db.get(query, [DNI], async (Error, Cliente) => {
        if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });

        if (Cliente) return res.status(400).json({ Error: 'DNI ya registrado.' });

        const hash = await encriptarPassword(Contraseña);
        const queryInsert = `
            INSERT INTO Cliente(DNI, Nombre, Apellido, Mail, Fecha_Nac, Contraseña, Cod_Postal, Telefono, Direccion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.run(queryInsert, [DNI, Nombre, Apellido, Mail, Fecha_Nac || null, hash, Cod_Postal || null, Telefono || null, Direccion || null],
            (Error) => {
                if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });
                res.status(201).json({ Mensaje: 'Cliente registrado correctamente.', DNI });
            });
    });
};

const modificarCliente = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Apellido, Mail, Fecha_Nac, Contraseña, Cod_Postal, Telefono, Direccion } = req.body;

    if (!Nombre || !Apellido || !Mail) return res.status(400).json({ Error: 'Faltan datos para modificar.' });

    if (Contraseña) {
        const hash = await encriptarPassword(Contraseña);
        const query = `
            UPDATE Cliente SET Nombre=?, Apellido=?, Mail=?, Fecha_Nac=?, Contraseña=?, Cod_Postal=?, Telefono=?, Direccion=?
            WHERE DNI=?`;
        db.run(query, [Nombre, Apellido, Mail, Fecha_Nac, hash, Cod_Postal, Telefono, Direccion, DNI],
            function (Error) {
                if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });
                res.json({ Mensaje: 'Cliente modificado correctamente.', Cambios: this.changes });
            });
    } else {
        const query = `
            UPDATE Cliente SET Nombre=?, Apellido=?, Mail=?, Fecha_Nac=?, Cod_Postal=?, Telefono=?, Direccion=?
            WHERE DNI=?`;
        db.run(query, [Nombre, Apellido, Mail, Fecha_Nac, Cod_Postal, Telefono, Direccion, DNI],
            function (Error) {
                if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });
                res.json({ Mensaje: 'Cliente modificado correctamente.', Cambios: this.changes });
            });
    }
};

const eliminarCliente = (req, res) => {
    const { DNI } = req.params;
    const query = 'DELETE FROM Cliente WHERE DNI = ?';
    db.run(query, [DNI], function (Error) {
        if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });
        res.json({ Mensaje: 'Cliente eliminado correctamente.', Cambios: this.changes });
    });
};

//Personal
const registrarPersonal = async (req, res) => {
    const { DNI, Nombre, Apellido, Mail, Fecha_Nacimiento, Contraseña, Telefono, Direccion, Cargo } = req.body;

    if (!DNI || !Nombre || !Apellido || !Mail || !Contraseña || !Cargo)
        return res.status(400).json({ Error: 'Debe completar los datos.' });

    const query = 'SELECT * FROM Personal WHERE DNI = ? OR Mail = ?';
    db.get(query, [DNI, Mail], async (Error, personal) => {
        if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });

        if (personal) return res.status(400).json({ Error: 'DNI o Mail ya registrado.' });

        const hash = await encriptarPassword(Contraseña);
        const queryInsert = `
            INSERT INTO Personal(DNI, Nombre, Apellido, Mail, Fecha_Nacimiento, Contraseña, Telefono, Direccion, Cargo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(queryInsert, [DNI, Nombre, Apellido, Mail, Fecha_Nacimiento, hash, Telefono, Direccion, Cargo],
            function (Error) {
                if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });
                res.status(201).json({ Mensaje: 'Personal registrado correctamente.', DNI, Cargo });
            });
    });
};

const modificarPersonal = async (req, res) => {
    const { DNI } = req.params;
    const { Nombre, Apellido, Mail, Fecha_Nacimiento, Contraseña, Telefono, Direccion, Cargo } = req.body;

    if (!Nombre || !Apellido || !Mail || !Cargo)
        return res.status(400).json({ Error: 'Faltan datos.' });

    if (Contraseña) {
        const hash = await encriptarPassword(Contraseña);
        const query = `
            UPDATE Personal SET Nombre=?, Apellido=?, Mail=?, Fecha_Nacimiento=?, Contraseña=?, Telefono=?, Direccion=?, Cargo=?
            WHERE DNI=?`;
        db.run(query, [Nombre, Apellido, Mail, Fecha_Nacimiento, hash, Telefono, Direccion, Cargo, DNI],
            function (Error) {
                if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });
                res.json({ Mensaje: 'Personal modificado correctamente.', Cambios: this.changes });
            });
    } else {
        const query = `
            UPDATE Personal SET Nombre=?, Apellido=?, Mail=?, Fecha_Nacimiento=?, Telefono=?, Direccion=?, Cargo=?
            WHERE DNI=?`;
        db.run(query, [Nombre, Apellido, Mail, Fecha_Nacimiento, Telefono, Direccion, Cargo, DNI],
            function (Error) {
                if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });
                res.json({ Mensaje: 'Personal modificado correctamente.', Cambios: this.changes });
            });
    }
};

const eliminarPersonal = (req, res) => {
    const { DNI } = req.params;
    if (!DNI) return res.status(400).json({ Error: 'DNI no proporcionado.' });

    db.get('SELECT DNI, Cargo FROM Personal WHERE DNI = ?', [DNI], (err, personal) => {
        if (err) return res.status(500).json({ Error: 'Error al verificar personal.' });

        if (!personal) return res.status(404).json({ Error: 'Personal no encontrado.' });

        db.run('PRAGMA foreign_keys = OFF', () => {
            db.run('DELETE FROM Personal WHERE DNI = ?', [DNI], function (Error) {
                db.run('PRAGMA foreign_keys = ON');
                if (Error) return res.status(500).json({ Error: 'Error al eliminar personal.' });
                res.json({ Mensaje: 'Personal eliminado correctamente.', Cambios: this.changes });
            });
        });
    });
};

//Login
const login = async (req, res) => {
    const { Mail, Contraseña } = req.body;
    if (!Mail || !Contraseña) return res.status(400).json({ Error: 'Debe completar Mail y Contraseña.' });

    db.get('SELECT * FROM Cliente WHERE Mail = ?', [Mail], async (Error, cliente) => {
        if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });

        if (cliente) {
            const valid = await compararPassword(Contraseña, cliente.Contraseña);
            if (!valid) return res.status(401).json({ Error: 'Contraseña incorrecta.' });

            return res.json({ Mensaje: `Bienvenido ${cliente.Nombre}`, DNI: cliente.DNI, Cargo: 'cliente' });
        }

        db.get('SELECT * FROM Personal WHERE Mail = ?', [Mail], async (Error, personal) => {
            if (Error) return res.status(500).json({ Error: 'Error en Server o Query.' });
            if (!personal) return res.status(404).json({ Error: 'Usuario no encontrado.' });

            const valid = await compararPassword(Contraseña, personal.Contraseña);
            if (!valid) return res.status(401).json({ Error: 'Contraseña incorrecta.' });

            return res.json({
                Mensaje: `Bienvenido ${personal.Cargo} ${personal.Nombre}`,
                DNI: personal.DNI,
                Cargo: personal.Cargo
            });
        });
    });
};

//Ver
// Obtener todos los clientes (solo puede ver el personal)
const obtenerClientes = (req, res) => {
    const { Cargo } = req.body

    if (Cargo !== 'Empleado' && Cargo !== 'Gerente' && Cargo !== 'SuperAdmin') {
        return res.status(403).json({ Error: 'No tiene permisos para ver los clientes.' })
    }

    db.all('SELECT DNI, Nombre, Apellido, Mail, Telefono, Direccion, Cod_Postal FROM Cliente', [], (Error, filas) => {
        if (Error) {
            console.error('Error al obtener clientes:', Error)
            return res.status(500).json({ Error: 'Error al obtener clientes.' })
        }
        res.json(filas)
    })
}

// Obtener todos los empleados (solo los pueden ver Gerentes y SuperAdmin)
const obtenerEmpleados = (req, res) => {
    const { Cargo } = req.body

    if (Cargo !== 'Gerente' && Cargo !== 'SuperAdmin') {
        return res.status(403).json({ Error: 'No tiene permisos para ver los empleados.' })
    }

    db.all('SELECT DNI, Nombre, Apellido, Mail, Cargo FROM Personal WHERE Cargo = ?', ['Empleado'], (Error, filas) => {
        if (Error) {
            console.error('Error al obtener empleados:', Error)
            return res.status(500).json({ Error: 'Error al obtener empleados.' })
        }
        res.json(filas)
    })
}

// Obtener todos los gerentes (solo los puede ver el SuperAdmin)
const obtenerGerentes = (req, res) => {
    const { Cargo } = req.body

    if (Cargo !== 'SuperAdmin') {
        return res.status(403).json({ Error: 'No tiene permisos para ver los gerentes.' })
    }

    db.all('SELECT DNI, Nombre, Apellido, Mail, Cargo FROM Personal WHERE Cargo = ?', ['Gerente'], (Error, filas) => {
        if (Error) {
            console.error('Error al obtener gerentes:', Error)
            return res.status(500).json({ Error: 'Error al obtener gerentes.' })
        }
        res.json(filas)
    })
}


module.exports = {
    registrarCliente,
    modificarCliente,
    eliminarCliente,
    registrarPersonal,
    modificarPersonal,
    eliminarPersonal,
    login,
    obtenerClientes,
    obtenerEmpleados,
    obtenerGerentes,
    obtenerClientePorDNI
};