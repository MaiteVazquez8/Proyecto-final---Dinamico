// src/Controllers/MeGusta.Controller.js
const db = require('../DataBase/db');

// dar me gusta a un producto
const darMeGusta = (req, res) => {
  const { DNI, ID_Producto } = req.body;
  if (!DNI || !ID_Producto) return res.status(400).json({ Error: 'Faltan datos.' });

  // evitar duplicados
  db.get(`SELECT 1 FROM Me_Gusta WHERE DNI = ? AND ID_Producto = ?`, [DNI, ID_Producto], (err, exists) => {
    if (err) {
      console.error('darMeGusta exists check:', err);
      return res.status(500).json({ Error: 'Error en el servidor.' });
    }
    if (exists) return res.status(409).json({ Error: 'Ya marcaste Me Gusta a este producto.' });

    db.run(`INSERT INTO Me_Gusta (DNI, ID_Producto) VALUES (?, ?)`, [DNI, ID_Producto], function (Error) {
      if (Error) {
        console.error('darMeGusta insert:', Error);
        return res.status(500).json({ Error: 'Error al dar Me Gusta.' });
      }

      // actualizar count (no crítico)
      db.get(`SELECT COUNT(*) AS total FROM Me_Gusta WHERE ID_Producto = ?`, [ID_Producto], (errCnt, fila) => {
        if (!errCnt && fila) {
          db.run(`UPDATE Productos SET Cant_Me_Gusta = ? WHERE ID_Producto = ?`, [fila.total, ID_Producto]);
        }
      });

      res.json({ Mensaje: 'Me Gusta agregado correctamente.' });
    });
  });
};

// mover Me Gusta al carrito
const meGustaAlCarrito = (req, res) => {
  const { DNI } = req.body;
  if (!DNI) return res.status(400).json({ Error: 'DNI requerido.' });

  db.all(`SELECT ID_Producto FROM Me_Gusta WHERE DNI = ?`, [DNI], (Error, productos) => {
    if (Error) {
      console.error('meGustaAlCarrito:', Error);
      return res.status(500).json({ Error: 'Error al obtener Me Gusta.' });
    }
    if (!productos || productos.length === 0) return res.status(400).json({ Error: 'No hay productos en Me Gusta.' });

    const stm = db.prepare(`INSERT INTO Carrito (DNI, ID_Producto, Total) SELECT ?, ID_Producto, Precio FROM Productos WHERE ID_Producto = ?`);
    productos.forEach(p => stm.run([DNI, p.ID_Producto]));
    stm.finalize(err => {
      if (err) {
        console.error('meGustaAlCarrito insert batch:', err);
        return res.status(500).json({ Error: 'Error al agregar al carrito.' });
      }
      res.json({ Mensaje: 'Productos de Me Gusta agregados al carrito.' });
    });
  });
};

module.exports = {
  darMeGusta,
  meGustaAlCarrito
};