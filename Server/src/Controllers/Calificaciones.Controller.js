// src/Controllers/Calificaciones.Controller.js
const db = require('../DataBase/db');

// listar calificaciones (todas)
const obtenerCalificaciones = (req, res) => {
  const query = `SELECT c.ID_Calificacion, c.DNI, cli.Nombre AS Cliente, c.ID_Producto, p.Nombre AS Producto, c.Puntuacion, c.Fecha
                 FROM Calificaciones c
                 LEFT JOIN Cliente cli ON c.DNI = cli.DNI
                 LEFT JOIN Productos p ON c.ID_Producto = p.ID_Producto`;
  db.all(query, [], (Error, filas) => {
    if (Error) {
      console.error('obtenerCalificaciones:', Error);
      return res.status(500).json({ Error: 'Error al obtener calificaciones.' });
    }
    res.json(filas);
  });
};

const crearCalificacion = (req, res) => {
  const { DNI, ID_Producto, Puntuacion } = req.body;
  if (!DNI || !ID_Producto || Puntuacion == null) return res.status(400).json({ Error: 'Faltan datos.' });
  if (Puntuacion < 1 || Puntuacion > 5) return res.status(400).json({ Error: 'Puntuación inválida.' });

  // verificar que el cliente haya comprado el producto
  db.get(
    `SELECT 1 FROM Detalles_Compra dc JOIN Compras c ON dc.ID_Compra = c.ID_Compra WHERE c.DNI = ? AND dc.ID_Producto = ? LIMIT 1`,
    [DNI, ID_Producto],
    (Error, compra) => {
      if (Error) {
        console.error('crearCalificacion verificar compra:', Error);
        return res.status(500).json({ Error: 'Error en servidor.' });
      }
      if (!compra) return res.status(403).json({ Error: 'No puedes calificar sin haber comprado el producto.' });

      const fecha = new Date().toISOString();
      db.run(`INSERT INTO Calificaciones (ID_Producto, DNI, Puntuacion, Fecha) VALUES (?, ?, ?, ?)`, [ID_Producto, DNI, Puntuacion, fecha], function (Error) {
        if (Error) {
          console.error('crearCalificacion insert:', Error);
          return res.status(500).json({ Error: 'Error al guardar calificación.' });
        }

        // actualizar promedio
        db.get(`SELECT AVG(Puntuacion) AS promedio FROM Calificaciones WHERE ID_Producto = ?`, [ID_Producto], (errAgg, fila) => {
          if (!errAgg && fila && fila.promedio != null) {
            db.run(`UPDATE Productos SET Promedio_Calificacion = ? WHERE ID_Producto = ?`, [fila.promedio, ID_Producto]);
          }
        });

        res.status(201).json({ Mensaje: 'Calificación creada correctamente.', ID_Calificacion: this.lastID });
      });
    }
  );
};

const editarCalificacion = (req, res) => {
  const { ID_Calificacion } = req.params;
  const { Puntuacion } = req.body;
  if (Puntuacion == null) return res.status(400).json({ Error: 'Puntuación requerida.' });
  if (Puntuacion < 1 || Puntuacion > 5) return res.status(400).json({ Error: 'Puntuación inválida.' });

  db.run(`UPDATE Calificaciones SET Puntuacion = ?, Fecha = ? WHERE ID_Calificacion = ?`, [Puntuacion, new Date().toISOString(), ID_Calificacion], function (Error) {
    if (Error) {
      console.error('editarCalificacion:', Error);
      return res.status(500).json({ Error: 'Error al editar calificación.' });
    }
    if (this.changes === 0) return res.status(404).json({ Error: 'Calificación no encontrada.' });
    res.json({ Mensaje: 'Calificación actualizada correctamente.' });
  });
};

const eliminarCalificacion = (req, res) => {
  const { ID_Calificacion } = req.params;
  db.run(`DELETE FROM Calificaciones WHERE ID_Calificacion = ?`, [ID_Calificacion], function (Error) {
    if (Error) {
      console.error('eliminarCalificacion:', Error);
      return res.status(500).json({ Error: 'Error al eliminar calificación.' });
    }
    if (this.changes === 0) return res.status(404).json({ Error: 'Calificación no encontrada.' });
    res.json({ Mensaje: 'Calificación eliminada correctamente.' });
  });
};

const obtenerPromedioPorProducto = (req, res) => {
  const { ID_Producto } = req.params;
  if (!ID_Producto) return res.status(400).json({ Error: 'ID_Producto requerido.' });

  db.get(`SELECT ID_Producto, AVG(Puntuacion) AS Promedio, COUNT(*) AS Total FROM Calificaciones WHERE ID_Producto = ? GROUP BY ID_Producto`, [ID_Producto], (Error, fila) => {
    if (Error) {
      console.error('obtenerPromedioPorProducto:', Error);
      return res.status(500).json({ Error: 'Error al calcular promedio.' });
    }
    if (!fila) return res.status(404).json({ Error: 'No hay calificaciones para este producto.' });
    res.json({ ID_Producto: fila.ID_Producto, Promedio: Number(fila.Promedio).toFixed(2), Total: fila.Total });
  });
};

module.exports = {
  obtenerCalificaciones,
  crearCalificacion,
  editarCalificacion,
  eliminarCalificacion,
  obtenerPromedioPorProducto
};