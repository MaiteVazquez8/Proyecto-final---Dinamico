const db = require('../DataBase/db');

//CARRITO
const agregarAlCarrito = (req, res) => {
    const { DNI, ID_Producto, Total } = req.body;
    if (!DNI || !ID_Producto || Total == null) return res.status(400).json({ Error: 'Faltan datos.' });

    db.run(`INSERT INTO Carrito(DNI, ID_Producto, Total) VALUES (?, ?, ?)`,
        [DNI, ID_Producto, Total], function(Error) {
            if (Error) return res.status(500).json({ Error: 'Error al agregar al carrito.' });
            res.json({ Mensaje: 'Producto agregado al carrito.', ID_Carrito: this.lastID });
        });
};

const verCarrito = (req, res) => {
    const { DNI } = req.params;
    db.all(`SELECT c.ID_Carrito, p.Nombre, p.Precio, c.Total 
            FROM Carrito c JOIN Productos p ON c.ID_Producto = p.ID_Producto 
            WHERE c.DNI=?`, [DNI], (Error, filas) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener carrito.' });
        res.json(filas);
    });
};

const eliminarDelCarrito = (req, res) => {
    const { ID_Carrito } = req.params;
    db.run(`DELETE FROM Carrito WHERE ID_Carrito=?`, [ID_Carrito], function(Error) {
        if (Error) return res.status(500).json({ Error: 'Error al eliminar del carrito.' });
        res.json({ Mensaje: 'Producto eliminado del carrito.', Cambios: this.changes });
    });
};

//ME GUSTA
const darMeGusta = (req, res) => {
    const { DNI, ID_Producto } = req.body;
    if (!DNI || !ID_Producto) return res.status(400).json({ Error: 'Faltan datos.' });

    db.run(`INSERT INTO Me_Gusta(DNI, ID_Producto) VALUES (?, ?)`, [DNI, ID_Producto], function(Error) {
        if (Error) return res.status(500).json({ Error: 'Error al dar Me Gusta.' });

        db.get(`SELECT COUNT(*) AS total FROM Me_Gusta WHERE ID_Producto=?`, [ID_Producto], (Error, fila) => {
            if (!Error) db.run(`UPDATE Productos SET Cant_Me_Gusta=? WHERE ID_Producto=?`, [fila.total, ID_Producto]);
        });

        res.json({ Mensaje: 'Me Gusta agregado correctamente.' });
    });
};

const meGustaAlCarrito = (req, res) => {
    const { DNI } = req.body;
    db.all(`SELECT ID_Producto FROM Me_Gusta WHERE DNI=?`, [DNI], (Error, productos) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener productos de Me Gusta' });
        if (!productos.length) return res.status(400).json({ Error: 'No hay productos en Me Gusta' });

        productos.map(item => {
            db.run(`INSERT INTO Carrito(DNI, ID_Producto, Total)
                    SELECT ?, ID_Producto, Precio FROM Productos WHERE ID_Producto=?`,
                    [DNI, item.ID_Producto]);
        });

        res.json({ Mensaje: 'Productos de Me Gusta agregados al carrito.' });
    });
};

//COMENTARIOS
const comentarProducto = (req, res) => {
    const { DNI, ID_Producto, Texto } = req.body;
    if (!DNI || !ID_Producto || !Texto) return res.status(400).json({ Error: 'Faltan datos.' });

    db.get(`SELECT * FROM Compras WHERE DNI=? AND ID_Productos=?`, [DNI, ID_Producto], (Error, compra) => {
        if (Error) return res.status(500).json({ Error: 'Error en server' });
        if (!compra) return res.status(403).json({ Error: 'No puedes comentar este producto porque no lo compraste.' });

        db.run(`INSERT INTO Comentarios(DNI, ID_Producto, Texto) VALUES (?, ?, ?)`,
            [DNI, ID_Producto, Texto], function(Error) {
                if (Error) return res.status(500).json({ Error: 'Error al comentar producto.' });

                db.get(`SELECT COUNT(*) AS total FROM Comentarios WHERE ID_Producto=?`, [ID_Producto], (Error, fila) => {
                    if (!Error) db.run(`UPDATE Productos SET Cant_Comentarios=? WHERE ID_Producto=?`, [fila.total, ID_Producto]);
                });

                res.json({ Mensaje: 'Comentario agregado correctamente.' });
            });
    });
};

//CALIFICACIONES
const calificarProducto = (req, res) => {
    const { DNI, ID_Producto, Calificacion } = req.body;
    if (!DNI || !ID_Producto || Calificacion == null) return res.status(400).json({ Error: 'Faltan datos.' });

    db.get(`SELECT * FROM Compras WHERE DNI=? AND ID_Productos=?`, [DNI, ID_Producto], (Error, compra) => {
        if (Error) return res.status(500).json({ Error: 'Error en server' });
        if (!compra) return res.status(403).json({ Error: 'No puedes calificar este producto porque no lo compraste.' });

        db.run(`INSERT INTO Calificaciones(DNI, ID_Producto, Puntuacion) VALUES (?, ?, ?)`, [DNI, ID_Producto, Calificacion], function(Error) {
            if (Error) return res.status(500).json({ Error: 'Error al calificar.' });

            db.get(`SELECT AVG(Puntuacion) AS promedio FROM Calificaciones WHERE ID_Producto=?`, [ID_Producto], (Error, fila) => {
                if (!Error) db.run(`UPDATE Productos SET Promedio_Calificacion=? WHERE ID_Producto=?`, [fila.promedio, ID_Producto]);
            });

            res.json({ Mensaje: 'Producto calificado correctamente.' });
        });
    });
};

//COMPRAS
const realizarCompra = (req, res) => {
    const { DNI, Tipo_Envio, Metodo_Pago } = req.body;
    if (!DNI || !Tipo_Envio || !Metodo_Pago) return res.status(400).json({ Error: 'Faltan datos.' });

    db.all(`SELECT * FROM Carrito WHERE DNI=?`, [DNI], (Error, carrito) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener carrito.' });
        if (!carrito.length) return res.status(400).json({ Error: 'Carrito vacío.' });

        const totalCompra = carrito.reduce((acc, item) => acc + item.Total, 0);

        db.run(`INSERT INTO Compras(DNI, Fecha_Compra, Total, Tipo_Envio, Metodo_Pago) VALUES (?, ?, ?, ?, ?)`,
            [DNI, new Date().toISOString(), totalCompra, Tipo_Envio, Metodo_Pago], function(Error) {
                if (Error) return res.status(500).json({ Error: 'Error al crear compra.' });
                const ID_Compra = this.lastID;

                carrito.map(item => {
                    db.run(`DELETE FROM Carrito WHERE ID_Carrito=?`, [item.ID_Carrito]);
                });

                res.json({ Mensaje: 'Compra realizada correctamente.', ID_Compra, Total: totalCompra });
            });
    });
};

const verComprasClientes = (req, res) => {
    const { DNI } = req.params;
    db.all(`SELECT * FROM Compras WHERE DNI=?`, [DNI], (Error, filas) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener compras.' });
        res.json(filas);
    });
};

module.exports = {
    agregarAlCarrito,
    verCarrito,
    eliminarDelCarrito,
    darMeGusta,
    meGustaAlCarrito,
    comentarProducto,
    calificarProducto,
    realizarCompra,
    verComprasClientes
};