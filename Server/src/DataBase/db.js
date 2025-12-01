// src/DataBase/db.js
const sqlite = require('sqlite3');
const path = require('path');

const dbUbicacion = path.resolve(__dirname, './Sistema.db');

const db = new sqlite.Database(dbUbicacion, (Error) => {
  if (Error) {
    console.error('No se pudo conectar o crear la base de datos:', Error.message);
    return;
  }
  console.log('Base de datos conectada correctamente.');

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    // Tablas principales
    db.run(`
      CREATE TABLE IF NOT EXISTS Proveedor (
        ID_Proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
        Nombre TEXT,
        Mail TEXT,
        Telefono TEXT,
        Direccion TEXT
      );
    `);

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
        Fecha_Publicacion TEXT,
        Cant_Me_Gusta INTEGER DEFAULT 0,
        Promedio_Calificacion REAL DEFAULT 0.0,
        Imagen_1 TEXT,
        Imagen_2 TEXT,
        FOREIGN KEY (ID_Proveedor) REFERENCES Proveedor(ID_Proveedor) ON DELETE RESTRICT
      );
    `);

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
        validacion INTEGER NOT NULL DEFAULT 0,
        token_validacion TEXT,
        token_recuperacion TEXT,
        token_2fa TEXT,
        doble_factor_enabled INTEGER DEFAULT 0,
        Descuento_Porcentaje REAL DEFAULT 0,
        Descuento_Vencimiento TEXT
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Personal (
        DNI TEXT PRIMARY KEY,
        Nombre TEXT,
        Apellido TEXT,
        Telefono TEXT,
        Mail TEXT,
        Fecha_Nacimiento TEXT,
        Direccion TEXT,
        Password TEXT,
        Rol TEXT,
        Verificado INTEGER DEFAULT 0,
        token_validacion TEXT,
        token_recuperacion TEXT,
        token_2fa TEXT,
        doble_factor_enabled INTEGER DEFAULT 0
      );
    `);

    // Resto de tablas (comentarios, compras, etc.)
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

    db.run(`
      CREATE TABLE IF NOT EXISTS Compras (
        ID_Compra INTEGER PRIMARY KEY AUTOINCREMENT,
        Fecha_Compra TEXT,
        DNI TEXT,
        Total REAL,
        Tipo_Envio TEXT,
        Descripcion TEXT,
        ID_Factura INTEGER,
        FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE RESTRICT
      );
    `);

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

    db.run(`
      CREATE TABLE IF NOT EXISTS Carrito (
        ID_Carrito INTEGER PRIMARY KEY AUTOINCREMENT,
        ID_Producto INTEGER,
        DNI TEXT,
        Total REAL,
        FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE CASCADE,
        FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto) ON DELETE CASCADE
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS Me_Gusta (
        ID_Me_Gusta INTEGER PRIMARY KEY AUTOINCREMENT,
        ID_Producto INTEGER,
        DNI TEXT,
        FOREIGN KEY (DNI) REFERENCES Cliente(DNI) ON DELETE CASCADE,
        FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto) ON DELETE CASCADE
      );
    `);

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

    console.log('Se crearon/verificaron todas las tablas correctamente.');
  });
});

module.exports = db;