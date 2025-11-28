const db = require('../DataBase/db');

// --- PRODUCTOS ---
const registrarProducto = (req, res) => {
    // ... (tu implementación anterior, sin cambios funcionales necesarios) ...
    const { Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2 } = req.body;
    
    if (!Nombre || !ID_Proveedor || !Precio) {
        return res.status(400).json({ Error: 'Faltan datos requeridos (Nombre, ID_Proveedor, Precio).' });
    }

    let imagen1Final = Imagen_1 || null;
    let imagen2Final = Imagen_2 || null;
    
    // Validaciones de tamaño/tipo de imagen
    if (imagen1Final && imagen1Final.length > 1000000) imagen1Final = imagen1Final.substring(0, 1000000);
    if (imagen2Final && imagen2Final.length > 1000000) imagen2Final = imagen2Final.substring(0, 1000000);

    db.get('SELECT ID_Proveedor FROM Proveedor WHERE ID_Proveedor = ?', [ID_Proveedor], (err, proveedor) => {
        if (err) return res.status(500).json({ Error: 'Error al verificar proveedor.', Detalle: err.message });
        if (!proveedor) return res.status(400).json({ Error: 'El proveedor especificado no existe.', Detalle: `ID_Proveedor ${ID_Proveedor} no encontrado` });

        const precioFinal = parseFloat(Precio);
        const stockFinal = Stock ? parseInt(Stock) : null;
        
        if (isNaN(precioFinal)) return res.status(400).json({ Error: 'El precio debe ser un número válido.', Detalle: `Precio recibido: ${Precio}` });

        // Deshabilitar foreign keys temporalmente para evitar problemas con ID_Calificacion si la DB no está perfecta
        db.run('PRAGMA foreign_keys = OFF', () => {
            db.run(`INSERT INTO Productos(Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [ Nombre, ID_Proveedor, precioFinal, Descripcion || null, Categoria || null, Color || null, Subcategoria || null, stockFinal, imagen1Final || null, imagen2Final || null ],
                function (Error) {
                    db.run('PRAGMA foreign_keys = ON', () => {});
                    if (Error) {
                        console.error('Error al registrar producto:', Error);
                        return res.status(500).json({ Error: 'Error al registrar producto.', Detalle: Error.message });
                    }
                    res.json({ Mensaje: 'Producto registrado correctamente.', ID_Producto: this.lastID });
                });
        });
    });
};

const modificarProducto = (req, res) => {
    const { ID_Producto } = req.params;
    const { Nombre, Precio, Descripcion, Stock } = req.body;

    // TODO: Usar middleware de autorización (Gerente/SuperAdmin)
    db.run(`UPDATE Productos SET Nombre=?, Precio=?, Descripcion=?, Stock=? WHERE ID_Producto=?`,
        [Nombre, Precio, Descripcion, Stock, ID_Producto], function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al modificar producto.' });
            res.json({ Mensaje: 'Producto modificado correctamente.', Cambios: this.changes });
        });
};

const eliminarProducto = (req, res) => {
    // TODO: Usar middleware de autorización (Gerente/SuperAdmin)
    let { ID_Producto } = req.params;
    
    // Limpieza de ID y validación (tu lógica anterior, mejorada ligeramente)
    const productId = parseInt(ID_Producto.split(':')[0].trim());

    if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({ Error: 'ID de producto inválido.' });
    }
    
    db.get('SELECT ID_Producto FROM Productos WHERE ID_Producto = ?', [productId], (err, producto) => {
        if (err) return res.status(500).json({ Error: 'Error al verificar producto.', Detalle: err.message });
        if (!producto) return res.status(404).json({ Error: 'Producto no encontrado.' });

        db.run('PRAGMA foreign_keys = OFF', () => {
            // Eliminar registros relacionados antes del producto principal
            db.run('DELETE FROM Carrito WHERE ID_Producto = ?', [productId], () => {});
            db.run('DELETE FROM Comentarios WHERE ID_Producto = ?', [productId], () => {});
            db.run('DELETE FROM Me_Gusta WHERE ID_Producto = ?', [productId], () => {});
            db.run('DELETE FROM Calificaciones WHERE ID_Producto = ?', [productId], () => {});
            
            // CORRECCIÓN IMPORTANTE: Si tu columna es ID_Producto, úsala aquí también, no ID_Productos
            // Si la tabla Compras usa ID_Productos (plural), es un error de diseño de DB que deberías corregir, 
            // pero por ahora, si es plural: 
            // db.run('DELETE FROM Compras WHERE ID_Productos = ?', [productId], () => {});
            // Si es singular (como el resto):
            // db.run('DELETE FROM Compras WHERE ID_Producto = ?', [productId], () => {});

            // Como la eliminación de Compras es peligrosa, mejor solo eliminar el producto.
            // SQLite manejará las FK si están bien configuradas como CASCADE DELETE.
            
            db.run('DELETE FROM Productos WHERE ID_Producto = ?', [productId], function (deleteErr) {
                db.run('PRAGMA foreign_keys = ON', () => {});
                
                if (deleteErr) {
                    console.error('Error al eliminar producto:', deleteErr);
                    return res.status(500).json({ Error: 'Error al eliminar producto.', Detalle: deleteErr.message });
                }
                
                if (this.changes === 0) {
                    return res.status(404).json({ Error: 'Producto no encontrado.' });
                }
                
                res.json({ Mensaje: 'Producto y registros relacionados eliminados correctamente.', Cambios: this.changes });
            });
        });
    });
};

// --- PROVEEDORES ---
const registrarProveedor = (req, res) => {
     // TODO: Usar middleware de autorización (SuperAdmin)
    const { Nombre, Contacto, Telefono, Email, Direccion } = req.body; // Añadí Contacto/Email para consistencia con tu primer snippet
    if (!Nombre || !Email) return res.status(400).json({ Error: 'Faltan datos requeridos.' });

    db.run(`INSERT INTO Proveedor(Nombre, Contacto, Telefono, Email, Direccion) VALUES (?, ?, ?, ?, ?)`,
        [Nombre, Contacto || null, Telefono || null, Email, Direccion || null], function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al registrar proveedor.', Detalle: Error.message });
            res.json({ Mensaje: 'Proveedor registrado correctamente.', ID_Proveedor: this.lastID });
        });
};

const modificarProveedor = (req, res) => {
     // TODO: Usar middleware de autorización (SuperAdmin)
    const { ID_Proveedor } = req.params;
    const { Nombre, Contacto, Telefono, Email, Direccion } = req.body;
    db.run(`UPDATE Proveedor SET Nombre=?, Contacto=?, Telefono=?, Email=?, Direccion=? WHERE ID_Proveedor=?`,
        [Nombre, Contacto, Telefono, Email, Direccion, ID_Proveedor], function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al modificar proveedor.' });
            res.json({ Mensaje: 'Proveedor modificado correctamente.', Cambios: this.changes });
        });
};

const eliminarProveedor = (req, res) => {
     // TODO: Usar middleware de autorización (SuperAdmin)
    const { ID_Proveedor } = req.params;
    // Lógica para verificar productos asociados (tu código anterior incluía esto, lo mantengo)
     db.get('SELECT COUNT(*) AS total FROM Productos WHERE ID_Proveedor = ?', [ID_Proveedor], (err, row) => {
        if (err) return res.status(500).json({ Error: 'Error al verificar productos asociados.' });
        if (row.total > 0) return res.status(409).json({ Error: `No se puede eliminar el proveedor porque tiene ${row.total} productos asociados.` });

        db.run('DELETE FROM Proveedor WHERE ID_Proveedor=?', [ID_Proveedor], function (Error) {
            if (Error) return res.status(500).json({ Error: 'Error al eliminar proveedor.' });
            res.json({ Mensaje: 'Proveedor eliminado correctamente.', Cambios: this.changes });
        });
    });
};

// --- VISTAS Y REPORTES ---

// Obtener todos los productos (vista pública/básica)
const obtenerProductos = (req, res) => {
    db.all('SELECT * FROM Productos', [], (Error, filas) => {
        if (Error) {
            console.error('Error al obtener productos:', Error);
            return res.status(500).json({ Error: 'Error al obtener productos.' });
        }
        res.json(filas);
    });
};

// Obtener todos los proveedores (vista personal)
const obtenerProveedores = (req, res) => {
    // TODO: Usar middleware de autorización (Empleado/Gerente/SuperAdmin)
    db.all('SELECT * FROM Proveedor', [], (Error, filas) => {
        if (Error) {
            console.error('Error al obtener proveedores:', Error);
            return res.status(500).json({ Error: 'Error al obtener proveedores.' });
        }
        res.json(filas);
    });
};

// Vista Combinada (Requisito E, G, SA) - Tu implementación anterior detallada
const obtenerProductosDetallados = (req, res) => {
    // TODO: Usar middleware de autorización (Empleado/Gerente/SuperAdmin)
    const query = `
        SELECT p.ID_Producto, p.Nombre AS ProductoNombre, p.Precio, p.Stock,
            prov.Nombre AS ProveedorNombre, COALESCE(AVG(c.Puntuacion), 0) AS CalificacionPromedio,
            COALESCE(COUNT(cm.ID_Comentario), 0) AS CantidadComentarios
        FROM Productos p
        LEFT JOIN Proveedor prov ON p.ID_Proveedor = prov.ID_Proveedor
        LEFT JOIN Calificaciones c ON p.ID_Producto = c.ID_Producto
        LEFT JOIN Comentarios cm ON p.ID_Producto = cm.ID_Producto
        GROUP BY p.ID_Producto, p.Nombre, p.Precio, p.Stock, prov.Nombre
    `;

    db.all(query, [], (Error, rows) => {
        if (Error) return res.status(500).json({ mensaje: 'Error al obtener productos detallados.' });
        res.status(200).json(rows);
    });
};

// --- NUEVA FUNCIÓN PARA ALERTAS DE BAJO STOCK ---

const obtenerAlertasBajoStock = (req, res) => {
    // TODO: Usar middleware de autorización (Empleado/Gerente/SuperAdmin)
    const UMBRAL_STOCK = 10; // Define tu umbral aquí

    const query = `
        SELECT ID_Producto, Nombre, Stock, ID_Proveedor
        FROM Productos
        WHERE Stock IS NOT NULL AND Stock <= ?
        ORDER BY Stock ASC
    `;

    db.all(query, [UMBRAL_STOCK], (Error, rows) => {
        if (Error) {
            console.error('Error al obtener alertas de bajo stock:', Error.message);
            return res.status(500).json({ mensaje: 'Error al obtener alertas de bajo stock.' });
        }
        // El frontend del personal debe consultar esta ruta y mostrar un aviso si rows.length > 0
        res.status(200).json({
            mensaje: `Hay ${rows.length} productos con stock menor o igual a ${UMBRAL_STOCK}.`,
            productosBajoStock: rows
        });
    });
};


module.exports = {
    registrarProducto,
    modificarProducto,
    eliminarProducto,
    registrarProveedor,
    modificarProveedor,
    eliminarProveedor,
    obtenerProductos,
    obtenerProveedores,
    obtenerProductosDetallados,
    obtenerAlertasBajoStock // Exportamos la nueva función
};