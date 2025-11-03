const db = require('../DataBase/db');

//PRODUCTOS
const registrarProducto = (req, res) => {
    const { Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2 } = req.body;
    if (!Nombre || !ID_Proveedor || !Precio) return res.status(400).json({ Error: 'Faltan datos.' });

    db.run(`INSERT INTO Productos(Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2],
        function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al registrar producto.' });
            res.json({ Mensaje: 'Producto registrado correctamente.', ID_Producto: this.lastID });
        });
};

const modificarProducto = (req, res) => {
    const { ID_Producto } = req.params;
    const { Nombre, Precio, Descripcion, Stock } = req.body;

    db.run(`UPDATE Productos SET Nombre=?, Precio=?, Descripcion=?, Stock=? WHERE ID_Producto=?`,
        [Nombre, Precio, Descripcion, Stock, ID_Producto], function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al modificar producto.' });
            res.json({ Mensaje: 'Producto modificado correctamente.', Cambios: this.changes });
        });
};

const eliminarProducto = (req, res) => {
    const { ID_Producto } = req.params;
    db.run('DELETE FROM Productos WHERE ID_Producto=?', [ID_Producto], function (Error) {
        if (Error) return res.status(500).json({ Error: 'Error al eliminar producto.' });
        res.json({ Mensaje: 'Producto eliminado correctamente.', Cambios: this.changes });
    });
};

//PROVEEDORES
const registrarProveedor = (req, res) => {
    const { Nombre, Mail, Telefono, Direccion } = req.body;
    if (!Nombre) return res.status(400).json({ Error: 'Faltan datos.' });

    db.run('INSERT INTO Proveedor(Nombre, Mail, Telefono, Direccion) VALUES (?, ?, ?, ?)',
        [Nombre, Mail, Telefono, Direccion], function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al registrar proveedor.' });
            res.json({ Mensaje: 'Proveedor registrado correctamente.', ID_Proveedor: this.lastID });
        });
};

const modificarProveedor = (req, res) => {
    const { ID_Proveedor } = req.params;
    const { Nombre, Mail, Telefono, Direccion } = req.body;

    db.run('UPDATE Proveedor SET Nombre=?, Mail=?, Telefono=?, Direccion=? WHERE ID_Proveedor=?',
        [Nombre, Mail, Telefono, Direccion, ID_Proveedor], function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al modificar proveedor.' });
            res.json({ Mensaje: 'Proveedor modificado correctamente.', Cambios: this.changes });
        });
};

const eliminarProveedor = (req, res) => {
    const { ID_Proveedor } = req.params;
    db.run('DELETE FROM Proveedor WHERE ID_Proveedor=?', [ID_Proveedor], function (Error) {
        if (Error) return res.status(500).json({ Error: 'Error al eliminar proveedor.' });
        res.json({ Mensaje: 'Proveedor eliminado correctamente.', Cambios: this.changes });
    });
};

module.exports = {
    registrarProducto,
    modificarProducto,
    eliminarProducto,
    registrarProveedor,
    modificarProveedor,
    eliminarProveedor
};