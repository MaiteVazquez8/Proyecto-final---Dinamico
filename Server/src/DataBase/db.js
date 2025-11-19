const sqlite=require('sqlite3')
const path=require('path')

const dbUbicacion=path.resolve(__dirname,'./Sistema.db')

const db = new sqlite.Database(dbUbicacion, (Error) => {
    if (Error) {
        console.error('No se pudo conectar o crear la base de datos:', Error.message);
    } else {
        console.log('Base de datos conectada correctamente.');

        db.serialize(() => {
            db.run('PRAGMA foreign_keys = ON')
            //CALIFICACIONES
            db.run(`
            CREATE TABLE IF NOT EXISTS Calificaciones (
                ID_Calificacion INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Producto INTEGER,
                DNI INTEGER,
                Calificacion TEXT
            );
        `);

            // CLIENTE
            db.run(`
            CREATE TABLE IF NOT EXISTS Cliente (
                DNI TEXT PRIMARY KEY,
                Nombre TEXT,
                Apellido TEXT,
                Mail TEXT,
                Fecha_Nac TEXT,
                Contraseña TEXT,
                Cod_Postal INTEGER,
                Token INTEGER,
                Telefono INTEGER,
                Direccion TEXT,
                ID_Compra INTEGER,
                ID_Calificacion INTEGER,
                FOREIGN KEY (ID_Calificacion) REFERENCES Calificaciones(ID_Calificacion),
                FOREIGN KEY (ID_Compra) REFERENCES Compras(ID_Compra)
            );
        `);

            // PERSONAL
            db.run(`
            CREATE TABLE IF NOT EXISTS Personal (
                DNI TEXT,
                ID_Personal INTEGER  PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT,
                Apellido TEXT,
                Telefono INTEGER,
                Mail TEXT,
                Fecha_Nacimiento TEXT,
                Direccion TEXT,
                Cargo TEXT,
                ID_Pago INTEGER,
                ID_Factura INTEGER,
                FOREIGN KEY (ID_Pago) REFERENCES Pagos(ID_Pago),
                FOREIGN KEY (ID_Factura) REFERENCES Facturacion(ID_Factura)
            );
        `);

            // PROVEEDOR
            db.run(`
            CREATE TABLE IF NOT EXISTS Proveedor (
                ID_Proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT,
                Mail TEXT,
                Telefono INTEGER,
                Direccion TEXT
            );
        `);

            // PRODUCTOS
            db.run(`
            CREATE TABLE IF NOT EXISTS Productos (
                ID_Producto INTEGER PRIMARY KEY AUTOINCREMENT,
                Nombre TEXT,
                ID_Proveedor INTEGER,
                Precio REAL,
                Descripcion TEXT,
                Categoria TEXT,
                Color TEXT,
                Cant_Ventas INTEGER,
                Subcategoria TEXT,
                Stock INTEGER,
                Cant_Comentarios INTEGER,
                Fecha_Publicacion INTEGER,
                Cant_Me_Gusta INTEGER,
                Imagen_1 TEXT,
                Imagen_2 TEXT,
                Promedio_Calificacion REAL,
                ID_Calificacion INTEGER,
                FOREIGN KEY (ID_Calificacion) REFERENCES Calificaciones(ID_Calificacion),
                FOREIGN KEY (ID_Proveedor) REFERENCES Proveedor(ID_Proveedor)
            );
        `);

            // COMENTARIOS
            db.run(`
            CREATE TABLE IF NOT EXISTS Comentarios (
                ID_Comentario INTEGER PRIMARY KEY AUTOINCREMENT,
                Texto TEXT,
                ID_Producto INTEGER,
                DNI INTEGER,
                Titulo TEXT,
                Puntuacion INTEGER,
                Fecha TEXT,
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI),
                FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
            );
        `);




            // COMPRAS
            db.run(`
            CREATE TABLE IF NOT EXISTS Compras (
                ID_Compra INTEGER PRIMARY KEY AUTOINCREMENT,
                Fecha_Compra TEXT,
                DNI INTEGER,
                Total REAL,
                Descripcion TEXT,
                ID_Productos INTEGER,
                Tipo_Envio TEXT,
                ID_Factura INTEGER,
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI),
                FOREIGN KEY (ID_Factura) REFERENCES Facturacion(ID_Factura),
                FOREIGN KEY (ID_Productos) REFERENCES Productos(ID_Producto)
            );
        `);


            // FACTURACION
            db.run(`
            CREATE TABLE IF NOT EXISTS Facturacion (
                ID_Factura INTEGER PRIMARY KEY AUTOINCREMENT,
                Id_Compra INTEGER,
                Fecha_Compra INTEGER,
                Id_Producto INTEGER,
                Metodo_Pago TEXT,
                DNI INTEGER,
                Costo_Envio INTEGER,
                Tipo_Envio TEXT,
                FOREIGN KEY (Id_Compra) REFERENCES Compras(ID_Compra),
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI)
            );
        `);

            // CARRITO
            db.run(`
            CREATE TABLE IF NOT EXISTS Carrito (
                ID_Carrito INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Producto INTEGER,
                DNI INTEGER,
                Total INTEGER,
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI),
                FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
            );
        `);

            // ME GUSTA
            db.run(`
            CREATE TABLE IF NOT EXISTS Me_Gusta (
                ID_Me_Gusta INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Producto INTEGER,
                DNI INTEGER,
                ID_Carrito INTEGER,
                Total INTEGER,
                FOREIGN KEY (DNI) REFERENCES Cliente(DNI),
                FOREIGN KEY (ID_Carrito) REFERENCES Carrito(ID_Carrito),
                FOREIGN KEY (ID_Producto) REFERENCES Productos(ID_Producto)
            );
        `);

            // PAGOS
            db.run(`
            CREATE TABLE IF NOT EXISTS Pagos (
                ID_Pago INTEGER PRIMARY KEY AUTOINCREMENT,
                ID_Personal INTEGER,
                Nombre TEXT,
                Apellido TEXT,
                DNI INTEGER,
                Sueldo INTEGER,
                Fecha_Pago TEXT,
                ID_Factura TEXT,
                FOREIGN KEY (ID_Personal) REFERENCES Personal(DNI)
            );
        `);

        //ENVIOS
            db.run(`
            CREATE TABLE IF NOT EXISTS Envios (
                ID_Envio INTEGER PRIMARY KEY AUTOINCREMENT,
                DNI INTEGER,
                Tipo_Envio TEXT,
                ID_Factura TEXT,
                Direccion TEXT,
                Cod_Postal INTEGER,
                FOREIGN KEY (DNI) REFERENCES Personal(DNI) 
            );
        `);

            console.log("Se crearon todas las tablas.");
        });
    }
})

module.exports=db