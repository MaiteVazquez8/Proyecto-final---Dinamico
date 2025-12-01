// src/Controllers/Comentarios.Controller.js
const db = require('../DataBase/db');

// obtener comentarios por producto (y también existe endpoint para todos si lo querés)
const obtenerComentariosPorProducto = (req, res) => {
  const { ID_Producto } = req.params;
  if (!ID_Producto) return res.status(400).json({ Error: 'ID_Producto requerido.' });

  db.all(
    `SELECT c.ID_Comentario, c.Texto, COALESCE(c.Titulo, '') AS Titulo, COALESCE(c.Puntuacion, 5) AS Puntuacion, COALESCE(c.Fecha, date('now')) AS Fecha, c.DNI,
            COALESCE(cli.Nombre || ' ' || cli.Apellido, 'Usuario') AS Nombre_Usuario
     FROM Comentarios c
     LEFT JOIN Cliente cli ON c.DNI = cli.DNI
     WHERE c.ID_Producto = ?
     ORDER BY COALESCE(c.Fecha, '1970-01-01') DESC`,
    [ID_Producto],
    (Error, filas) => {
      if (Error) {
        console.error('obtenerComentariosPorProducto:', Error);
        return res.status(500).json({ Error: 'Error al obtener comentarios.' });
      }
      res.json(filas || []);
    }
  );
};

const crearComentario = (req, res) => {
  const { Texto, ID_Producto, DNI, Titulo, Puntuacion } = req.body;
  if (!Texto || !ID_Producto || !DNI) return res.status(400).json({ Error: 'Faltan datos obligatorios.' });

  const fecha = new Date().toISOString();
  db.run(
    `INSERT INTO Comentarios (Texto, ID_Producto, DNI, Titulo, Puntuacion, Fecha) VALUES (?, ?, ?, ?, ?, ?)`,
    [Texto, ID_Producto, DNI, Titulo || null, Puntuacion != null ? Puntuacion : null, fecha],
    function (Error) {
      if (Error) {
        console.error('crearComentario:', Error);
        return res.status(500).json({ Error: 'Error al crear comentario.' });
      }

      // actualizar contador y promedio en Productos (no crítico)
      db.get(`SELECT COUNT(*) AS total, AVG(Puntuacion) AS promedio FROM Comentarios WHERE ID_Producto = ?`, [ID_Producto], (errAgg, fila) => {
        if (!errAgg && fila) {
          db.run(`UPDATE Productos SET Cant_Comentarios = ?, Promedio_Calificacion = ? WHERE ID_Producto = ?`, [fila.total, fila.promedio || 0, ID_Producto]);
        }
      });

      res.status(201).json({ Mensaje: 'Comentario agregado correctamente.', ID_Comentario: this.lastID });
    }
  );
};

const editarComentario = (req, res) => {
  const { ID_Comentario } = req.params;
  const { Texto, Titulo, Puntuacion } = req.body;
  if (!Texto && !Titulo && Puntuacion == null) return res.status(400).json({ Error: 'Envía al menos un campo.' });

  db.run(
    `UPDATE Comentarios SET Texto = COALESCE(?, Texto), Titulo = COALESCE(?, Titulo), Puntuacion = COALESCE(?, Puntuacion) WHERE ID_Comentario = ?`,
    [Texto, Titulo, Puntuacion, ID_Comentario],
    function (Error) {
      if (Error) {
        console.error('editarComentario:', Error);
        return res.status(500).json({ Error: 'Error al editar comentario.' });
      }
      if (this.changes === 0) return res.status(404).json({ Error: 'Comentario no encontrado.' });
      res.json({ Mensaje: 'Comentario actualizado correctamente.' });
    }
  );
};

const eliminarComentario = (req, res) => {
  const { ID_Comentario } = req.params;
  db.run(`DELETE FROM Comentarios WHERE ID_Comentario = ?`, [ID_Comentario], function (Error) {
    if (Error) {
      console.error('eliminarComentario:', Error);
      return res.status(500).json({ Error: 'Error al eliminar comentario.' });
    }
    if (this.changes === 0) return res.status(404).json({ Error: 'Comentario no encontrado.' });
    res.json({ Mensaje: 'Comentario eliminado correctamente.' });
  });
};

module.exports = {
  obtenerComentariosPorProducto,
  crearComentario,
  editarComentario,
  eliminarComentario
};