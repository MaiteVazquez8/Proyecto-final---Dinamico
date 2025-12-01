// src/Controllers/Productos.Controller.js
const db = require('../DataBase/db');

// registrar producto
const registrarProducto = (req, res) => {
  const { Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2 } = req.body;
  if (!Nombre || !ID_Proveedor || Precio == null) return res.status(400).json({ Error: 'Faltan datos requeridos.' });

  db.get(`SELECT ID_Proveedor FROM Proveedor WHERE ID_Proveedor = ?`, [ID_Proveedor], (err, proveedor) => {
    if (err) {
      console.error('registrarProducto proveedor:', err);
      return res.status(500).json({ Error: 'Error en DB.' });
    }
    if (!proveedor) return res.status(400).json({ Error: 'Proveedor no existe.' });

    const precioFinal = parseFloat(Precio);
    const stockFinal = Stock != null ? parseInt(Stock, 10) : null;
    if (isNaN(precioFinal)) return res.status(400).json({ Error: 'Precio inválido.' });

    // opcional: limitamos el tamaño del base64 de imagen por caracteres (mejor hacerlo en frontend)
    const imagen1Final = Imagen_1 && Imagen_1.length > 1000000 ? Imagen_1.substring(0, 1000000) : Imagen_1 || null;
    const imagen2Final = Imagen_2 && Imagen_2.length > 1000000 ? Imagen_2.substring(0, 1000000) : Imagen_2 || null;

    db.run(`INSERT INTO Productos (Nombre, ID_Proveedor, Precio, Descripcion, Categoria, Color, Subcategoria, Stock, Imagen_1, Imagen_2)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Nombre, ID_Proveedor, precioFinal, Descripcion || null, Categoria || null, Color || null, Subcategoria || null, stockFinal, imagen1Final, imagen2Final],
      function (Error) {
        if (Error) {
          console.error('registrarProducto insert:', Error);
          return res.status(500).json({ Error: 'Error al registrar producto.' });
        }
        res.json({ Mensaje: 'Producto registrado correctamente.', ID_Producto: this.lastID });
      });
  });
};

const modificarProducto = (req, res) => {
  const { ID_Producto } = req.params;
  const { Nombre, Precio, Descripcion, Stock } = req.body;
  if (!ID_Producto) return res.status(400).json({ Error: 'ID_Producto requerido.' });

  db.run(`UPDATE Productos SET Nombre = COALESCE(?, Nombre), Precio = COALESCE(?, Precio), Descripcion = COALESCE(?, Descripcion), Stock = COALESCE(?, Stock) WHERE ID_Producto = ?`,
    [Nombre, Precio, Descripcion, Stock, ID_Producto], function (Error) {
      if (Error) {
        console.error('modificarProducto:', Error);
        return res.status(500).json({ Error: 'Error al modificar producto.' });
      }
      if (this.changes === 0) return res.status(404).json({ Error: 'Producto no encontrado.' });
      res.json({ Mensaje: 'Producto modificado correctamente.', Cambios: this.changes });
    });
};

const eliminarProducto = (req, res) => {
  let { ID_Producto } = req.params;
  if (!ID_Producto) return res.status(400).json({ Error: 'ID_Producto requerido.' });

  const productId = parseInt(String(ID_Producto).split(':')[0].trim(), 10);
  if (isNaN(productId) || productId <= 0) return res.status(400).json({ Error: 'ID_Producto inválido.' });

  db.get(`SELECT ID_Producto FROM Productos WHERE ID_Producto = ?`, [productId], (err, prod) => {
    if (err) {
      console.error('eliminarProducto select:', err);
      return res.status(500).json({ Error: 'Error en DB.' });
    }
    if (!prod) return res.status(404).json({ Error: 'Producto no encontrado.' });

    // Eliminar dependencias primero para evitar errores de FK
    db.serialize(() => {
      // Eliminar detalles de compra (historial de compras) - SOLICITADO POR EL USUARIO
      db.run(`DELETE FROM Detalles_Compra WHERE ID_Producto = ?`, [productId], (err) => {
        if (err) console.error('Error eliminando detalles de compra:', err);
      });

      // Eliminar comentarios
      db.run(`DELETE FROM Comentarios WHERE ID_Producto = ?`, [productId], (err) => {
        if (err) console.error('Error eliminando comentarios:', err);
      });

      // Eliminar calificaciones
      db.run(`DELETE FROM Calificaciones WHERE ID_Producto = ?`, [productId], (err) => {
        if (err) console.error('Error eliminando calificaciones:', err);
      });

      // Eliminar del carrito
      db.run(`DELETE FROM Carrito WHERE ID_Producto = ?`, [productId], (err) => {
        if (err) console.error('Error eliminando del carrito:', err);
      });

      // Eliminar me gusta
      db.run(`DELETE FROM Me_Gusta WHERE ID_Producto = ?`, [productId], (err) => {
        if (err) console.error('Error eliminando me gusta:', err);
      });

      // Finalmente eliminar el producto
      db.run(`DELETE FROM Productos WHERE ID_Producto = ?`, [productId], function (Error) {
        if (Error) {
          console.error('eliminarProducto delete:', Error);
          return res.status(500).json({ Error: 'Error al eliminar producto.' });
        }
        res.json({ Mensaje: 'Producto eliminado correctamente.', Cambios: this.changes });
      });
    });
  });
};

const registrarProveedor = (req, res) => {
  const { Nombre, Telefono, Mail, Direccion } = req.body;
  if (!Nombre || !Mail) return res.status(400).json({ Error: 'Faltan datos requeridos.' });

  db.run(`INSERT INTO Proveedor (Nombre, Telefono, Mail, Direccion) VALUES (?, ?, ?, ?)`, [Nombre, Telefono || null, Mail, Direccion || null], function (Error) {
    if (Error) {
      console.error('registrarProveedor:', Error);
      return res.status(500).json({ Error: 'Error al registrar proveedor.' });
    }
    res.json({ Mensaje: 'Proveedor registrado correctamente.', ID_Proveedor: this.lastID });
  });
};

const modificarProveedor = (req, res) => {
  const { ID_Proveedor } = req.params;
  const { Nombre, Telefono, Mail, Direccion } = req.body;
  db.run(`UPDATE Proveedor SET Nombre = COALESCE(?, Nombre), Telefono = COALESCE(?, Telefono), Mail = COALESCE(?, Mail), Direccion = COALESCE(?, Direccion) WHERE ID_Proveedor = ?`,
    [Nombre, Telefono, Mail, Direccion, ID_Proveedor], function (Error) {
      if (Error) {
        console.error('modificarProveedor:', Error);
        return res.status(500).json({ Error: 'Error al modificar proveedor.' });
      }
      if (this.changes === 0) return res.status(404).json({ Error: 'Proveedor no encontrado.' });
      res.json({ Mensaje: 'Proveedor modificado correctamente.', Cambios: this.changes });
    });
};

const eliminarProveedor = (req, res) => {
  const { ID_Proveedor } = req.params;
  db.get(`SELECT COUNT(*) AS total FROM Productos WHERE ID_Proveedor = ?`, [ID_Proveedor], (err, fila) => {
    if (err) {
      console.error('eliminarProveedor count productos:', err);
      return res.status(500).json({ Error: 'Error en DB.' });
    }
    if (fila && fila.total > 0) return res.status(409).json({ Error: `No se puede eliminar proveedor con ${fila.total} productos.` });

    db.run(`DELETE FROM Proveedor WHERE ID_Proveedor = ?`, [ID_Proveedor], function (Error) {
      if (Error) {
        console.error('eliminarProveedor delete:', Error);
        return res.status(500).json({ Error: 'Error al eliminar proveedor.' });
      }
      res.json({ Mensaje: 'Proveedor eliminado correctamente.', Cambios: this.changes });
    });
  });
};

const obtenerProductos = (req, res) => {
  db.all(`SELECT * FROM Productos`, [], (Error, filas) => {
    if (Error) {
      console.error('obtenerProductos:', Error);
      return res.status(500).json({ Error: 'Error al obtener productos.' });
    }
    res.json(filas || []);
  });
};

const obtenerProveedores = (req, res) => {
  db.all(`SELECT * FROM Proveedor`, [], (Error, filas) => {
    if (Error) {
      console.error('obtenerProveedores:', Error);
      return res.status(500).json({ Error: 'Error al obtener proveedores.' });
    }
    res.json(filas || []);
  });
};

const obtenerProductosDetallados = (req, res) => {
  const query = `
    SELECT p.ID_Producto, p.Nombre AS ProductoNombre, p.Precio, p.Stock,
           prov.Nombre AS ProveedorNombre, COALESCE( AVG(c.Puntuacion), 0) AS CalificacionPromedio,
           COALESCE( COUNT(cm.ID_Comentario), 0) AS CantidadComentarios
    FROM Productos p
    LEFT JOIN Proveedor prov ON p.ID_Proveedor = prov.ID_Proveedor
    LEFT JOIN Calificaciones c ON p.ID_Producto = c.ID_Producto
    LEFT JOIN Comentarios cm ON p.ID_Producto = cm.ID_Producto
    GROUP BY p.ID_Producto, p.Nombre, p.Precio, p.Stock, prov.Nombre
  `;
  db.all(query, [], (Error, rows) => {
    if (Error) {
      console.error('obtenerProductosDetallados:', Error);
      return res.status(500).json({ Error: 'Error al obtener productos detallados.' });
    }
    res.json(rows || []);
  });
};

const obtenerAlertasBajoStock = (req, res) => {
  const UMBRAL_STOCK = 10;
  db.all(`SELECT ID_Producto, Nombre, Stock, ID_Proveedor FROM Productos WHERE Stock IS NOT NULL AND Stock <= ? ORDER BY Stock ASC`, [UMBRAL_STOCK], (Error, rows) => {
    if (Error) {
      console.error('obtenerAlertasBajoStock:', Error);
      return res.status(500).json({ Error: 'Error al obtener alertas de stock.' });
    }
    res.json({ mensaje: `Hay ${rows.length} productos con stock <= ${UMBRAL_STOCK}.`, productosBajoStock: rows });
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
  obtenerAlertasBajoStock
};