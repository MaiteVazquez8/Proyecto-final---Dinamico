const db = require('../db')

//ver
const obtenerCalificaciones = (req, res) => {
    const query = `SELECT c.ID_Calificacion, c.DNI, cli.Nombre AS Cliente, c.ID_Producto, p.Nombre AS Producto, c.Puntuacion, c.Fecha FROM Calificaciones c LEFT JOIN Cliente cli ON c.DNI = cli.DNI LEFT JOIN Productos p ON c.ID_Producto = p.ID_Producto`

    db.all(query, [], (Error, rows) => {
        if (Error) {
            console.error('Error al obtener calificaciones:', Error.message)
            return res.status(500).json({ mensaje: 'Error al obtener calificaciones.' })
        }
        res.status(200).json(rows)
    })
}

// calificar
const crearCalificacion = (req, res) => {
    const { DNI, ID_Producto, Puntuacion } = req.body

    if (!DNI || !ID_Producto || Puntuacion == null) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios (DNI, ID_Producto, Puntuacion).' })
    }

    if (Puntuacion < 1 || Puntuacion > 5) {
        return res.status(400).json({ mensaje: 'La puntuación debe estar entre 1 y 5.' })
    }

    const Fecha = new Date().toISOString()
    const query = `INSERT INTO Calificaciones (DNI, ID_Producto, Puntuacion, Fecha) VALUES (?, ?, ?, ?)`

    db.run(query, [DNI, ID_Producto, Puntuacion, Fecha], function (Error) {
        if (Error) {
            console.error('Error al crear calificación:', Error.message)
            return res.status(500).json({ mensaje: 'Error al crear calificación.' })
        }
        res.status(201).json({ mensaje: 'Calificación creada exitosamente.', ID_Calificacion: this.lastID })
    })
}

//editar
const editarCalificacion = (req, res) => {
    const { ID_Calificacion } = req.params
    const { Puntuacion } = req.body

    if (!Puntuacion) {
        return res.status(400).json({ mensaje: 'Debe enviar una nueva puntuación.' })
    }

    if (Puntuacion < 1 || Puntuacion > 5) {
        return res.status(400).json({ mensaje: 'La puntuación debe estar entre 1 y 5.' })
    }

    const query = `UPDATE Calificaciones SET Puntuacion = ?, Fecha = ? WHERE ID_Calificacion = ?`

    db.run(query, [Puntuacion, new Date().toISOString(), ID_Calificacion], function (Error) {
        if (Error) {
            console.error('Error al editar calificación:', Error.message)
            return res.status(500).json({ mensaje: 'Error al editar calificación.' })
        }
        if (this.changes === 0) {
            return res.status(404).json({ mensaje: 'Calificación no encontrada.' })
        }
        res.status(200).json({ mensaje: 'Calificación actualizada correctamente.' })
    })
}

// Eliminar
const eliminarCalificacion = (req, res) => {
    const { ID_Calificacion } = req.params

    const query = `DELETE FROM Calificaciones WHERE ID_Calificacion = ?`
    db.run(query, [ID_Calificacion], function (Error) {
        if (Error) {
            console.error('Error al eliminar calificación:', Error.message)
            return res.status(500).json({ mensaje: 'Error al eliminar calificación.' })
        }
        if (this.changes === 0) {
            return res.status(404).json({ mensaje: 'Calificación no encontrada.' })
        }
        res.status(200).json({ mensaje: 'Calificación eliminada correctamente.' })
    })
}

// Promedio
const obtenerPromedioPorProducto = (req, res) => {
    const { ID_Producto } = req.params

    const query = `SELECT ID_Producto, AVG(Puntuacion) AS Promedio, COUNT(*) AS Total FROM Calificaciones WHERE ID_Producto = ? GROUP BY ID_Producto`

    db.get(query, [ID_Producto], (Error, row) => {
        if (Error) {
            console.error('Error al calcular promedio:', Error.message)
            return res.status(500).json({ mensaje: 'Error al calcular promedio.' })
        }

        if (!row) {
            return res.status(404).json({ mensaje: 'No hay calificaciones para este producto.' })
        }

        res.status(200).json({
            ID_Producto: row.ID_Producto,
            Promedio: parseFloat(row.Promedio).toFixed(2),
            Total: row.Total
        })
    })
}

module.exports = {
    obtenerCalificaciones,
    crearCalificacion,
    editarCalificacion,
    eliminarCalificacion,
    obtenerPromedioPorProducto
}