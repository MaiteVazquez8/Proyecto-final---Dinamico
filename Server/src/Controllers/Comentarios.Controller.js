// Comentarios.Controller.js
const db = require('../db')

// Obtener todos los comentarios
const obtenerComentarios = (req, res) => {
    const query = `SELECT c.ID_Comentario, c.Texto, c.Titulo, c.Puntuacion, c.Fecha, p.Nombre AS Producto, cli.Nombre AS Cliente FROM Comentarios c LEFT JOIN Productos p ON c.ID_Producto = p.ID_Producto LEFT JOIN Cliente cli ON c.DNI = cli.DNI`
    db.all(query, [], (Error, rows) => {
        if (Error) {
            console.error('Error al obtener comentarios:', Error.message)
            return res.status(500).json({ mensaje: 'Error al obtener los comentarios.' })
        }
        res.status(200).json(rows)
    })
}

// Crear nuevo comentario
const crearComentario = (req, res) => {
    const { Texto, ID_Producto, DNI, Titulo, Puntuacion, Fecha } = req.body

    if (!Texto || !ID_Producto || !DNI) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios.' })
    }

    const query = `INSERT INTO Comentarios (Texto, ID_Producto, DNI, Titulo, Puntuacion, Fecha) VALUES (?, ?, ?, ?, ?, ?)`
    db.run(query, [Texto, ID_Producto, DNI, Titulo || '', Puntuacion || 0, Fecha || new Date().toISOString()],
        function (Error) {
            if (Error) {
                console.error('Error al crear comentario:', Error.message)
                return res.status(500).json({ mensaje: 'Error al crear comentario.' })
            }
            res.status(201).json({ mensaje: 'Comentario creado exitosamente.', ID_Comentario: this.lastID })
        }
    )
}

// Editar comentario existente
const editarComentario = (req, res) => {
    const { ID_Comentario } = req.params
    const { Texto, Titulo, Puntuacion } = req.body

    if (!Texto && !Titulo && Puntuacion == null) {
        return res.status(400).json({ mensaje: 'Debe enviar al menos un campo a actualizar.' })
    }

    const query = `UPDATE Comentarios SET Texto = COALESCE(?, Texto), Titulo = COALESCE(?, Titulo), Puntuacion = COALESCE(?, Puntuacion) WHERE ID_Comentario = ?`
    db.run(query, [Texto, Titulo, Puntuacion, ID_Comentario], function (Error) {
        if (Error) {
            console.error('Error al editar comentario:', Error.message)
            return res.status(500).json({ mensaje: 'Error al editar el comentario.' })
        }
        if (this.changes === 0) {
            return res.status(404).json({ mensaje: 'Comentario no encontrado.' })
        }
        res.status(200).json({ mensaje: 'Comentario actualizado correctamente.' })
    })
}

// Eliminar comentario
const eliminarComentario = (req, res) => {
    const { ID_Comentario } = req.params

    const query = `DELETE FROM Comentarios WHERE ID_Comentario = ?`
    db.run(query, [ID_Comentario], function (Error) {
        if (Error) {
            console.error('Error al eliminar comentario:', Error.message)
            return res.status(500).json({ mensaje: 'Error al eliminar el comentario.' })
        }
        if (this.changes === 0) {
            return res.status(404).json({ mensaje: 'Comentario no encontrado.' })
        }
        res.status(200).json({ mensaje: 'Comentario eliminado correctamente.' })
    })
}

module.exports = {
    obtenerComentarios,
    crearComentario,
    editarComentario,
    eliminarComentario
}