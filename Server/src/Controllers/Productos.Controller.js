const db = require('../DataBase/db');

//PRODUCTOS
const registrarProducto = (req, res) => {
    const { Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2 } = req.body;
    
    console.log('Datos recibidos para registrar producto:', {
        Nombre,
        ID_Proveedor,
        Precio,
        Descripcion: Descripcion ? 'Presente' : 'Vacío',
        Categoria: Categoria ? 'Presente' : 'Vacío',
        Color: Color ? 'Presente' : 'Vacío',
        Subcategoria: Subcategoria ? 'Presente' : 'Vacío',
        Stock,
        Imagen_1: Imagen_1 ? `Base64 (${Imagen_1.length} caracteres)` : 'Vacío',
        Imagen_2: Imagen_2 ? `Base64 (${Imagen_2.length} caracteres)` : 'Vacío'
    });
    
    if (!Nombre || !ID_Proveedor || !Precio) {
        return res.status(400).json({ Error: 'Faltan datos requeridos (Nombre, ID_Proveedor, Precio).' });
    }

    // Limitar el tamaño de las imágenes base64 si son muy grandes (máximo 1MB cada una)
    let imagen1Final = Imagen_1 || null;
    let imagen2Final = Imagen_2 || null;
    
    if (imagen1Final && imagen1Final.length > 1000000) {
        console.warn('Imagen 1 es muy grande, truncando');
        imagen1Final = imagen1Final.substring(0, 1000000);
    }
    
    if (imagen2Final && imagen2Final.length > 1000000) {
        console.warn('Imagen 2 es muy grande, truncando');
        imagen2Final = imagen2Final.substring(0, 1000000);
    }

    // Validar que el proveedor exista
    db.get('SELECT ID_Proveedor FROM Proveedor WHERE ID_Proveedor = ?', [ID_Proveedor], (err, proveedor) => {
        if (err) {
            console.error('Error al verificar proveedor:', err);
            return res.status(500).json({ 
                Error: 'Error al verificar proveedor.', 
                Detalle: err.message 
            });
        }
        
        if (!proveedor) {
            return res.status(400).json({ 
                Error: 'El proveedor especificado no existe.', 
                Detalle: `ID_Proveedor ${ID_Proveedor} no encontrado` 
            });
        }

        // Convertir valores numéricos
        const precioFinal = parseFloat(Precio);
        const stockFinal = Stock ? parseInt(Stock) : null;
        
        if (isNaN(precioFinal)) {
            return res.status(400).json({ 
                Error: 'El precio debe ser un número válido.', 
                Detalle: `Precio recibido: ${Precio}` 
            });
        }

        // Deshabilitar foreign keys temporalmente para evitar problemas con ID_Calificacion
        db.run('PRAGMA foreign_keys = OFF', (pragmaErr) => {
            if (pragmaErr) {
                console.error('Error al deshabilitar foreign keys:', pragmaErr);
            }
            
            // Insertar producto sin especificar ID_Calificacion
            db.run(`INSERT INTO Productos(Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    Nombre, 
                    ID_Proveedor, 
                    precioFinal, 
                    Descripcion || null, 
                    Categoria || null, 
                    Color || null, 
                    Subcategoria || null, 
                    stockFinal, 
                    imagen1Final || null, 
                    imagen2Final || null
                ],
                function (Error) {
                    // Rehabilitar foreign keys
                    db.run('PRAGMA foreign_keys = ON', () => {});
                    
                    if (Error) {
                        console.error('Error al registrar producto:', Error);
                        console.error('Detalles del error:', Error.message);
                        console.error('Código de error:', Error.code);
                        return res.status(500).json({ 
                            Error: 'Error al registrar producto.', 
                            Detalle: Error.message,
                            Codigo: Error.code
                        });
                    }
                    console.log('Producto registrado exitosamente con ID:', this.lastID);
                    res.json({ 
                        Mensaje: 'Producto registrado correctamente.', 
                        ID_Producto: this.lastID 
                    });
                });
        });
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
    let { ID_Producto } = req.params;
    
    // Limpiar el ID en caso de que tenga formato extraño (ej: "1:1" -> "1")
    if (typeof ID_Producto === 'string' && ID_Producto.includes(':')) {
        ID_Producto = ID_Producto.split(':')[0].trim();
        console.log('ID limpiado de formato extraño:', ID_Producto);
    }
    
    // Validar que el ID_Producto sea un número válido
    const productId = parseInt(ID_Producto);
    if (isNaN(productId) || productId <= 0) {
        console.error('ID_Producto inválido:', ID_Producto, '-> Parseado:', productId);
        return res.status(400).json({ 
            Error: 'ID de producto inválido.', 
            Detalle: `ID recibido: ${req.params.ID_Producto} -> Limpiado: ${ID_Producto} -> Parseado: ${productId}` 
        });
    }
    
    console.log(`Intentando eliminar producto con ID: ${productId} (recibido: ${req.params.ID_Producto})`);

    // Primero verificar si el producto existe
    db.get('SELECT ID_Producto FROM Productos WHERE ID_Producto = ?', [productId], (err, producto) => {
        if (err) {
            console.error('Error al verificar producto:', err);
            return res.status(500).json({ 
                Error: 'Error al verificar producto.', 
                Detalle: err.message 
            });
        }

        if (!producto) {
            return res.status(404).json({ 
                Error: 'Producto no encontrado.', 
                Detalle: `ID_Producto ${productId} no existe` 
            });
        }

        // Deshabilitar foreign keys y eliminar registros relacionados
        db.run('PRAGMA foreign_keys = OFF', (pragmaErr) => {
            if (pragmaErr) {
                console.error('Error al deshabilitar foreign keys:', pragmaErr);
                // Continuar de todos modos
            }

            // Función auxiliar para eliminar registros relacionados
            const eliminarRelaciones = (callback) => {
                let completed = 0;
                let hasError = false;
                const total = 5; // Total de operaciones

                const checkComplete = () => {
                    completed++;
                    if (completed === total) {
                        callback(hasError);
                    }
                };

                // Eliminar del carrito
                db.run('DELETE FROM Carrito WHERE ID_Producto = ?', [productId], (cartErr) => {
                    if (cartErr && !cartErr.message.includes('no such table')) {
                        console.warn('Advertencia al eliminar del carrito:', cartErr.message);
                    }
                    checkComplete();
                });

                // Eliminar comentarios
                db.run('DELETE FROM Comentarios WHERE ID_Producto = ?', [productId], (commentErr) => {
                    if (commentErr && !commentErr.message.includes('no such table')) {
                        console.warn('Advertencia al eliminar comentarios:', commentErr.message);
                    }
                    checkComplete();
                });

                // Eliminar me gusta
                db.run('DELETE FROM Me_Gusta WHERE ID_Producto = ?', [productId], (likeErr) => {
                    if (likeErr && !likeErr.message.includes('no such table')) {
                        console.warn('Advertencia al eliminar me gusta:', likeErr.message);
                    }
                    checkComplete();
                });

                // Eliminar calificaciones
                db.run('DELETE FROM Calificaciones WHERE ID_Producto = ?', [productId], (ratingErr) => {
                    if (ratingErr && !ratingErr.message.includes('no such table')) {
                        console.warn('Advertencia al eliminar calificaciones:', ratingErr.message);
                    }
                    checkComplete();
                });

                // Eliminar de compras (nota: usa ID_Productos en plural)
                db.run('DELETE FROM Compras WHERE ID_Productos = ?', [productId], (purchaseErr) => {
                    if (purchaseErr && !purchaseErr.message.includes('no such table')) {
                        console.warn('Advertencia al eliminar compras:', purchaseErr.message);
                    }
                    checkComplete();
                });
            };

            // Eliminar relaciones primero, luego el producto
            eliminarRelaciones(() => {
                // Eliminar el producto
                db.run('DELETE FROM Productos WHERE ID_Producto = ?', [productId], function (deleteErr) {
                    // Rehabilitar foreign keys
                    db.run('PRAGMA foreign_keys = ON', () => {});

                    if (deleteErr) {
                        console.error('Error al eliminar producto:', deleteErr);
                        console.error('Detalles del error:', deleteErr.message);
                        console.error('Código de error:', deleteErr.code);
                        return res.status(500).json({ 
                            Error: 'Error al eliminar producto.', 
                            Detalle: deleteErr.message,
                            Codigo: deleteErr.code,
                            SQL: deleteErr.sql
                        });
                    }

                    if (this.changes === 0) {
                        return res.status(404).json({ 
                            Error: 'Producto no encontrado.', 
                            Detalle: `No se pudo eliminar el producto con ID ${productId}` 
                        });
                    }

                    console.log(`Producto ${productId} eliminado exitosamente. Cambios: ${this.changes}`);
                    res.json({ 
                        Mensaje: 'Producto eliminado correctamente.', 
                        Cambios: this.changes 
                    });
                });
            });
        });
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

// Obtener todos los productos
const obtenerProductos = (req, res) => {
    db.all('SELECT * FROM Productos', [], (Error, filas) => {
        if (Error) {
            console.error('Error al obtener productos:', Error);
            return res.status(500).json({ Error: 'Error al obtener productos.' });
        }
        res.json(filas);
    });
};

// Obtener todos los proveedores
const obtenerProveedores = (req, res) => {
    db.all('SELECT * FROM Proveedor', [], (Error, filas) => {
        if (Error) {
            console.error('Error al obtener proveedores:', Error);
            return res.status(500).json({ Error: 'Error al obtener proveedores.' });
        }
        res.json(filas);
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
    obtenerProveedores
};