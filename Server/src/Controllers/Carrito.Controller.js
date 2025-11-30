// src/Controllers/Carrito.Controller.js
const db = require('../DataBase/db');

// agregar al carrito
const agregarAlCarrito = (req, res) => {
  const { DNI, ID_Producto, Total } = req.body;
  if (!DNI || !ID_Producto || Total == null) return res.status(400).json({ Error: 'Faltan datos.' });

  db.run(
    `INSERT INTO Carrito (DNI, ID_Producto, Total) VALUES (?, ?, ?)`,
    [DNI, ID_Producto, Total],
    function (Error) {
      if (Error) {
        console.error('agregarAlCarrito:', Error);
        return res.status(500).json({ Error: 'Error al agregar al carrito.' });
      }
      res.json({ Mensaje: 'Producto agregado al carrito.', ID_Carrito: this.lastID });
    }
  );
};

// ver carrito completo (detalle con producto)
const verCarrito = (req, res) => {
  const { DNI } = req.params;
  if (!DNI) return res.status(400).json({ Error: 'DNI requerido.' });

  db.all(
    `SELECT c.ID_Carrito, c.ID_Producto, c.Total,
            COALESCE(p.Nombre, 'Producto eliminado') AS Nombre,
            COALESCE(p.Precio, c.Total) AS Precio,
            p.Imagen_1, p.Imagen_2, p.Descripcion, p.Stock, p.Promedio_Calificacion
     FROM Carrito c
     LEFT JOIN Productos p ON c.ID_Producto = p.ID_Producto
     WHERE c.DNI = ?`,
    [DNI],
    (Error, filas) => {
      if (Error) {
        console.error('verCarrito:', Error);
        return res.status(500).json({ Error: 'Error al obtener carrito.' });
      }
      res.json(filas || []);
    }
  );
};

// eliminar ítem del carrito
const eliminarDelCarrito = (req, res) => {
  const { ID_Carrito } = req.params;
  if (!ID_Carrito) return res.status(400).json({ Error: 'ID_Carrito requerido.' });

  db.run(`DELETE FROM Carrito WHERE ID_Carrito = ?`, [ID_Carrito], function (Error) {
    if (Error) {
      console.error('eliminarDelCarrito:', Error);
      return res.status(500).json({ Error: 'Error al eliminar del carrito.' });
    }
    if (this.changes === 0) return res.status(404).json({ Error: 'Elemento no encontrado.' });
    res.json({ Mensaje: 'Producto eliminado del carrito.', Cambios: this.changes });
  });
};

module.exports = {
  agregarAlCarrito,
  verCarrito,
  eliminarDelCarrito
};