const sqlite = require('sqlite3');
const path = require('path');

// Asegúrate de que el path sea correcto
const dbUbicacion = path.resolve(__dirname, './Sistema.db');

const db = new sqlite.Database(dbUbicacion, (Error) => {
    if (Error) {
        console.error('No se pudo conectar o crear la base de datos:', Error.message);
    } else {
        console.log('Base de datos conectada correctamente.');

        db.serialize(() => {
            db.run('PRAGMA foreign_keys = ON');

            // --- PROVEEDOR (Tabla base, sin cambios) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Proveedor (
                ID_Proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT,
                Contacto TEXT,
                Mail TEXT,
                Telefono TEXT,
                Direccion TEXT
            );
            `);

            // --- PRODUCTOS (Alineado con controladores) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Productos (
                ID_Producto INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT,
                ID_Proveedor INTEGER,
                Precio REAL,
                Descripcion TEXT,
                Categoria TEXT,
                Color TEXT,
                Subcategoria TEXT,
                Stock INTEGER,
                Cant_Comentarios INTEGER DEFAULT 0,
                Cant_Me_Gusta INTEGER DEFAULT 0,
                Promedio_Calificacion REAL DEFAULT 0.0,
                Imagen_1 TEXT,
                Imagen_2 TEXT,
                FOREIGN KEY (ID_Proveedor) REFERENCES Proveedor(ID_Proveedor) ON DELETE RESTRICT
            );
            `);
            
            // --- CLIENTE (Añadidas columnas de validación y descuentos) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Cliente (
                DNI TEXT PRIMARY KEY,
                Nombre TEXT,
                Apellido TEXT,
                Mail TEXT,
                Fecha_Nac TEXT,
                Contraseña TEXT,
                Cod_Postal TEXT,
                Telefono TEXT,
                Direccion TEXT,
                -- Nuevas columnas requeridas para la lógica:
                validacion INTEGER NOT NULL DEFAULT 0, 
                token_validacion TEXT,
                token_recuperacion TEXT,
                Descuento_Porcentaje REAL DEFAULT 0,
                Descuento_Vencimiento TEXT
            );
            `);

            // --- PERSONAL (Añadidas columnas de token_recuperacion) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Personal (
                DNI TEXT PRIMARY KEY,
                Nombre TEXT,
                Apellido TEXT,
                Telefono TEXT,
                Mail TEXT,
                Fecha_Nacimiento TEXT,
                Direccion TEXT,
                Cargo TEXT, -- SuperAdmin, Gerente, Empleado
                -- Nueva columna para recuperación de contraseña
                token_recuperacion TEXT
            );
            `);

            // --- COMENTARIOS ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Comentarios (
                ID_Comentario INTEGER PRIMARY KEY AUTOINCREMENT,
                Texto TEXT,
                Titulo TEXT,
                Puntuacion INTEGER,
                Fecha TEXT,
                ID_Producto INTEGER,
                DNI TEXT,
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE CASCADE,
                FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto) ON DELETE CASCADE
            );
            `);

            // --- CALIFICACIONES (Usaremos la tabla Comentarios para puntuaciones, esta tabla es redundante) ---
            // Si insistes en mantenerla separada:
            db.run(`
            CREATE TABLE IF NOT EXISTS Calificaciones (
                ID_Calificacion INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Producto INTEGER,
                DNI TEXT,
                Puntuacion REAL,
                Fecha TEXT,
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE CASCADE,
                FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto) ON DELETE CASCADE
            );
            `);
        
            // --- COMPRAS (Corregida la relación a Facturacion y DNI) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Compras (
                ID_Compra INTEGER PRIMARY KEY AUTOINCREMENT,
                Fecha_Compra TEXT,
                DNI TEXT,
                Total REAL,
                Tipo_Envio TEXT,
                Descripcion TEXT, -- JSON con detalles de envío/pago
                ID_Factura INTEGER,
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE RESTRICT,
                FOREIGN KEY (ID_Factura) REFERENCES Facturacion(ID_Factura) ON DELETE SET NULL
            );
            `);
            
            // --- DETALLES DE COMPRA (TABLA NUEVA para manejar múltiples productos por compra) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Detalles_Compra (
                ID_Detalle INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Compra INTEGER,
                ID_Producto INTEGER,
                Cantidad INTEGER,
                PrecioUnitario REAL,
                FOREIGN KEY (ID_Compra) REFERENCES Compras(ID_Compra) ON DELETE CASCADE,
                FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto) ON DELETE RESTRICT
            );
            `);


            // --- FACTURACION (Simplificada) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Facturacion (
                ID_Factura INTEGER PRIMARY KEY AUTOINCREMENT,
                Id_Compra INTEGER,
                Fecha_Compra TEXT,
                Metodo_Pago TEXT,
                DNI TEXT,
                Costo_Envio REAL,
                Tipo_Envio TEXT,
                FOREIGN KEY (Id_Compra) REFERENCES Compras(ID_Compra) ON DELETE CASCADE,
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE RESTRICT
            );
            `);

            // --- CARRITO ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Carrito (
                ID_Carrito INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Producto INTEGER,
                DNI TEXT,
                Total REAL, -- Almacena el precio unitario en el momento de añadir
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE CASCADE,
                FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto) ON DELETE CASCADE
            );
            `);

            // --- ME GUSTA ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Me_Gusta (
                ID_Me_Gusta INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Producto INTEGER,
                DNI TEXT,
                -- Las columnas ID_Carrito y Total son redundantes aquí.
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE CASCADE,
                FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto) ON DELETE CASCADE
            );
            `);

            // --- PAGOS (Sueldos del personal) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Pagos (
                ID_Pago INTEGER PRIMARY KEY AUTOINCREMENT,
                DNI_Personal TEXT,
                Sueldo REAL,
                Fecha_Pago TEXT,
                Detalle TEXT,
                FOREIGN KEY (DNI_Personal) REFERENCES Personal(DNI) ON DELETE RESTRICT
            );
            `);

            // --- ENVIOS (Relacionado con compras, no con Personal DNI) ---
            db.run(`
            CREATE TABLE IF NOT EXISTS Envios (
                ID_Envio INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Compra INTEGER,
                Tipo_Envio TEXT,
                Direccion TEXT,
                Cod_Postal TEXT,
                Estado TEXT DEFAULT 'Pendiente',
                FOREIGN KEY (ID_Compra) REFERENCES Compras(ID_Compra) ON DELETE CASCADE
            );
            `);

            console.log("Se crearon/verificaron todas las tablas correctamente.");
        });
    }
});

module.exports = db;