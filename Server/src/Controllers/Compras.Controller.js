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
    console.log('Consultando carrito para DNI:', DNI);
    
    // Primero verificar qué hay en el carrito sin JOIN
    db.all(`SELECT * FROM Carrito WHERE DNI=?`, [DNI], (Error, carritoItems) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener carrito.' });
        console.log('Items en Carrito para DNI', DNI, ':', carritoItems);
        
        // Usar LEFT JOIN para que devuelva resultados incluso si el producto no existe en Productos
        db.all(`SELECT c.ID_Carrito, c.ID_Producto, c.Total, 
                       COALESCE(p.Nombre, 'Producto') AS Nombre, 
                       COALESCE(p.Precio, c.Total) AS Precio,
                       p.Imagen_1, p.Imagen_2, p.Descripcion, p.Stock, p.Promedio_Calificacion
                FROM Carrito c 
                LEFT JOIN Productos p ON c.ID_Producto = p.ID_Producto 
                WHERE c.DNI=?`, [DNI], (Error, filas) => {
            if (Error) {
                console.error('Error en JOIN:', Error);
                return res.status(500).json({ Error: 'Error al obtener carrito.' });
            }
            console.log('Resultado del JOIN para DNI', DNI, ':', filas);
            res.json(filas);
        });
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
// Obtener comentarios de un producto
const obtenerComentarios = (req, res) => {
    const { ID_Producto } = req.params;
    
    // Intentar obtener comentarios con las nuevas columnas, si falla usar las antiguas
    db.all(`
        SELECT c.ID_Comentario, c.Texto, 
               COALESCE(c.Titulo, 'Sin título') AS Titulo, 
               COALESCE(c.Puntuacion, 5) AS Puntuacion, 
               COALESCE(c.Fecha, date('now')) AS Fecha, 
               c.DNI,
               COALESCE(cl.Nombre || ' ' || cl.Apellido, 'Usuario') AS Nombre_Usuario
        FROM Comentarios c
        LEFT JOIN Cliente cl ON c.DNI = cl.DNI
        WHERE c.ID_Producto = ?
        ORDER BY COALESCE(c.Fecha, '1970-01-01') DESC
    `, [ID_Producto], (Error, filas) => {
        if (Error) {
            console.error('Error al obtener comentarios:', Error);
            // Si falla, intentar con estructura antigua
            db.all(`
                SELECT c.ID_Comentario, c.Texto, 
                       'Sin título' AS Titulo, 
                       5 AS Puntuacion, 
                       date('now') AS Fecha, 
                       c.DNI,
                       COALESCE(cl.Nombre || ' ' || cl.Apellido, 'Usuario') AS Nombre_Usuario
                FROM Comentarios c
                LEFT JOIN Cliente cl ON c.DNI = cl.DNI
                WHERE c.ID_Producto = ?
            `, [ID_Producto], (Error2, filas2) => {
                if (Error2) {
                    console.error('Error al obtener comentarios (fallback):', Error2);
                    return res.status(500).json({ Error: 'Error al obtener comentarios.', Detalle: Error2.message });
                }
                res.json(filas2 || []);
            });
            return;
        }
        res.json(filas || []);
    });
};

// Agregar comentario a un producto
const comentarProducto = (req, res) => {
    const { DNI, ID_Producto, Texto, Titulo, Puntuacion } = req.body;
    
    if (!DNI || !ID_Producto || !Texto) {
        return res.status(400).json({ Error: 'Faltan datos requeridos (DNI, ID_Producto, Texto).' });
    }

    // Obtener fecha actual
    const fecha = new Date().toISOString().split('T')[0];
    
    // Primero intentar insertar con las nuevas columnas
    db.run(`INSERT INTO Comentarios(DNI, ID_Producto, Texto, Titulo, Puntuacion, Fecha) VALUES (?, ?, ?, ?, ?, ?)`,
        [DNI, ID_Producto, Texto, Titulo || null, Puntuacion || null, fecha], function(Error) {
            if (Error) {
                console.error('Error al comentar producto (con nuevas columnas):', Error);
                // Si falla, intentar insertar solo con las columnas antiguas
                db.run(`INSERT INTO Comentarios(DNI, ID_Producto, Texto) VALUES (?, ?, ?)`,
                    [DNI, ID_Producto, Texto], function(Error2) {
                        if (Error2) {
                            console.error('Error al comentar producto (fallback):', Error2);
                            return res.status(500).json({ 
                                Error: 'Error al comentar producto.', 
                                Detalle: Error2.message 
                            });
                        }

                        // Actualizar cantidad de comentarios del producto
                        db.get(`SELECT COUNT(*) AS total FROM Comentarios WHERE ID_Producto=?`, [ID_Producto], (Error3, fila) => {
                            if (!Error3 && fila) {
                                db.run(`UPDATE Productos SET Cant_Comentarios=? WHERE ID_Producto=?`, [fila.total, ID_Producto]);
                            }
                        });

                        res.json({ 
                            Mensaje: 'Comentario agregado correctamente.',
                            ID_Comentario: this.lastID 
                        });
                    });
                return;
            }

            // Actualizar cantidad de comentarios del producto
            db.get(`SELECT COUNT(*) AS total FROM Comentarios WHERE ID_Producto=?`, [ID_Producto], (Error, fila) => {
                if (!Error && fila) {
                    db.run(`UPDATE Productos SET Cant_Comentarios=? WHERE ID_Producto=?`, [fila.total, ID_Producto]);
                }
            });

            // Si hay puntuación, actualizar también el promedio de calificaciones
            if (Puntuacion) {
                db.get(`SELECT AVG(Puntuacion) AS promedio FROM Comentarios WHERE ID_Producto=? AND Puntuacion IS NOT NULL`, [ID_Producto], (Error, fila) => {
                    if (!Error && fila && fila.promedio) {
                        db.run(`UPDATE Productos SET Promedio_Calificacion=? WHERE ID_Producto=?`, [fila.promedio, ID_Producto]);
                    }
                });
            }

            res.json({ 
                Mensaje: 'Comentario agregado correctamente.',
                ID_Comentario: this.lastID 
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
    const { 
        DNI, 
        Tipo_Envio, 
        Metodo_Pago,
        // Datos del formulario
        Nombre,
        Apellido,
        Email,
        Telefono,
        Direccion,
        Ciudad,
        Provincia,
        CodigoPostal,
        Pais,
        // Datos de pago (opcionales)
        DatosPago
    } = req.body;
    
    if (!DNI || !Tipo_Envio || !Metodo_Pago) return res.status(400).json({ Error: 'Faltan datos requeridos.' });

    db.all(`SELECT * FROM Carrito WHERE DNI=?`, [DNI], (Error, carrito) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener carrito.' });
        if (!carrito.length) return res.status(400).json({ Error: 'Carrito vacío.' });
        // Compute total and quantity per product (Carrito stores one row per unit)
        const totalCompra = carrito.reduce((acc, item) => acc + (item.Total || 0), 0);
        const qtyByProduct = {};
        carrito.forEach(item => {
            const pid = item.ID_Producto;
            qtyByProduct[pid] = (qtyByProduct[pid] || 0) + 1;
        });

        // Check stock for each product
        const productIds = Object.keys(qtyByProduct);
        if (productIds.length) {
            const placeholders = productIds.map(() => '?').join(',');
            db.all(`SELECT ID_Producto, Stock FROM Productos WHERE ID_Producto IN (${placeholders})`, productIds, (errProd, prodRows) => {
                if (errProd) {
                    console.error('Error al consultar stock de productos:', errProd);
                    return res.status(500).json({ Error: 'Error al verificar stock.' });
                }

                // Verify availability
                for (const pr of prodRows) {
                    const need = qtyByProduct[pr.ID_Producto] || 0;
                    if (pr.Stock == null || pr.Stock < need) {
                        return res.status(400).json({ Error: `Stock insuficiente para el producto ID ${pr.ID_Producto}. Disponible: ${pr.Stock || 0}, requerido: ${need}` });
                    }
                }

                // All good — proceed to insert purchase
                proceedWithPurchase();
            });
        } else {
            // No product ids? proceed
            proceedWithPurchase();
        }
        function proceedWithPurchase() {
            // Construir descripción con datos del formulario
            const descripcion = JSON.stringify({
            Nombre,
            Apellido,
            Email,
            Telefono,
            Direccion: Direccion || '',
            Ciudad: Ciudad || '',
            Provincia: Provincia || '',
            CodigoPostal: CodigoPostal || '',
            Pais: Pais || 'Argentina',
            DatosPago: DatosPago || {}
        });

        db.run(`INSERT INTO Compras(DNI, Fecha_Compra, Total, Tipo_Envio, Descripcion) VALUES (?, ?, ?, ?, ?)`,
            [DNI, new Date().toISOString(), totalCompra, Tipo_Envio, descripcion], function(Error) {
                if (Error) {
                    console.error('Error al crear compra:', Error);
                    return res.status(500).json({ Error: 'Error al crear compra.' });
                }
                const ID_Compra = this.lastID;

                // Crear registro en Facturacion con Metodo_Pago
                db.run(`INSERT INTO Facturacion(Id_Compra, Fecha_Compra, Metodo_Pago, DNI, Tipo_Envio, Costo_Envio) VALUES (?, ?, ?, ?, ?, ?)`,
                    [ID_Compra, new Date().toISOString(), Metodo_Pago, DNI, Tipo_Envio, 
                     Tipo_Envio === 'Retiro en Sucursal' ? 0 : (Tipo_Envio === 'Envío Express' ? 5000 : 3000)],
                    function(ErrorFact) {
                        if (ErrorFact) {
                            console.error('Error al crear facturación:', ErrorFact);
                        }
                    });

                // Decrement stock for each product purchased
                Object.keys(qtyByProduct).forEach(pid => {
                    const qty = qtyByProduct[pid];
                    // Ensure stock doesn't go negative — we already checked availability
                    db.run(`UPDATE Productos SET Stock = Stock - ? WHERE ID_Producto=?`, [qty, pid], function(errUp) {
                        if (errUp) console.error('Error al decrementar stock para producto', pid, errUp);
                    });
                });

                // Limpiar carrito
                carrito.forEach(item => {
                    db.run(`DELETE FROM Carrito WHERE ID_Carrito=?`, [item.ID_Carrito]);
                });

                // Actualizar datos del cliente con dirección y código postal si están presentes
                // Construir dirección completa si hay ciudad y provincia
                let direccionCompleta = '';
                if (Direccion) {
                    direccionCompleta = Direccion;
                    if (Ciudad) {
                        direccionCompleta = `${direccionCompleta}, ${Ciudad}`;
                    }
                    if (Provincia) {
                        direccionCompleta = `${direccionCompleta}, ${Provincia}`;
                    }
                } else if (Ciudad || Provincia) {
                    // Si no hay dirección pero hay ciudad o provincia, construir desde ahí
                    direccionCompleta = [Ciudad, Provincia].filter(Boolean).join(', ');
                }

                // Actualizar cliente con dirección y código postal si están presentes
                // Solo actualizar si hay valores para no sobrescribir con null
                if (direccionCompleta || CodigoPostal) {
                    let updateFields = [];
                    let updateValues = [];
                    
                    if (direccionCompleta) {
                        updateFields.push('Direccion = ?');
                        updateValues.push(direccionCompleta);
                    }
                    
                    if (CodigoPostal) {
                        updateFields.push('Cod_Postal = ?');
                        updateValues.push(CodigoPostal);
                    }
                    
                    if (updateFields.length > 0) {
                        updateValues.push(DNI);
                        const updateQuery = `UPDATE Cliente SET ${updateFields.join(', ')} WHERE DNI = ?`;
                        
                        db.run(updateQuery, updateValues, function(ErrorUpdate) {
                            if (ErrorUpdate) {
                                console.error('Error al actualizar datos del cliente:', ErrorUpdate);
                                // No fallar la compra si falla la actualización de dirección
                            } else {
                                console.log('Datos del cliente actualizados correctamente:', {
                                    Direccion: direccionCompleta || 'No actualizada',
                                    Cod_Postal: CodigoPostal || 'No actualizado'
                                });
                            }
                        });
                    }
                }

                res.json({ 
                    Mensaje: 'Compra realizada correctamente.', 
                    ID_Compra, 
                    Total: totalCompra 
                });
            });
        }
    });
};

const verComprasClientes = (req, res) => {
    const { DNI } = req.params;
    db.all(`SELECT * FROM Compras WHERE DNI=?`, [DNI], (Error, filas) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener compras.' });
        res.json(filas);
    });
};

// Obtener todas las compras (admin)
const obtenerTodasCompras = (req, res) => {
    db.all(`SELECT * FROM Compras ORDER BY Fecha_Compra DESC`, [], (Error, filas) => {
        if (Error) return res.status(500).json({ Error: 'Error al obtener compras.' });
        res.json(filas);
    });
};

// Actualizar estado de envío de una compra
const actualizarEstadoCompra = (req, res) => {
    const { ID_Compra } = req.params;
    const { Estado_Envio } = req.body;
    if (!ID_Compra || !Estado_Envio) return res.status(400).json({ Error: 'Faltan datos.' });

    db.run(`UPDATE Compras SET Estado_Envio = ? WHERE ID_Compra = ?`, [Estado_Envio, ID_Compra], function (Error) {
        if (Error) return res.status(500).json({ Error: 'Error al actualizar estado.' });
        res.json({ Mensaje: 'Estado actualizado correctamente.', Cambios: this.changes });
    });
};

module.exports = {
    agregarAlCarrito,
    verCarrito,
    eliminarDelCarrito,
    darMeGusta,
    meGustaAlCarrito,
    obtenerComentarios,
    comentarProducto,
    calificarProducto,
    realizarCompra,
    verComprasClientes,
    obtenerTodasCompras, 
    actualizarEstadoCompra
};