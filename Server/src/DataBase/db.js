const sqlite3 = require('sqlite3');
const path = require('path');

const dbUbicacion = path.resolve(__dirname, './Sistema.db');

const db = new sqlite3.Database(dbUbicacion, (Error) => {
    if (Error) {
        console.error('❗ No se pudo conectar o crear la base de datos:', Error.message);
    } else {
        console.log('✔ Base de datos conectada correctamente.');

        db.run(`
            CREATE TABLE IF NOT EXISTS Usuarios (
                ID INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT UNIQUE,
                Password TEXT,
                Name TEXT
            )
        `, (Error) => {
            if (Error) {
                console.error('❗ La tabla Usuarios no se pudo crear:', Error.message);
            } else {
                console.log('✔ Tabla Usuarios creada correctamente.');
            }
        });
    }
});

module.exports = db;