// src/Controllers/Compras.Controller.js
const db = require('../DataBase/db');

// reutilizamos Carrito logic; asumimos que Carrito.Controller está separado y se usa en rutas
// realizar compra con aplicación de descuentos (Cliente tiene Descuento_Porcentaje y Descuento_Vencimiento)
const realizarCompra = (req, res) => {
  const {
    DNI,
    Tipo_Envio,
    Metodo_Pago,
    Nombre, Apellido, Email, Telefono, Direccion, Ciudad, Provincia, CodigoPostal, Pais,
    DatosPago
  } = req.body;

  if (!DNI || !Tipo_Envio || !Metodo_Pago) return res.status(400).json({ Error: 'Faltan datos requeridos.' });

  db.all(`SELECT * FROM Carrito WHERE DNI = ?`, [DNI], (Error, carrito) => {
    if (Error) {
      console.error('realizarCompra obtener carrito:', Error);
      return res.status(500).json({ Error: 'Error al obtener carrito.' });
    }
    if (!carrito || carrito.length === 0) return res.status(400).json({ Error: 'Carrito vacío.' });

    // total base
    let totalCompra = carrito.reduce((acc, item) => acc + (item.Total || 0), 0);

    const qtyByProduct = {};
    carrito.forEach(item => { qtyByProduct[item.ID_Producto] = (qtyByProduct[item.ID_Producto] || 0) + 1; });

    // obtener descuento vigente desde cliente
    db.get(`SELECT Descuento_Porcentaje, Descuento_Vencimiento FROM Cliente WHERE DNI = ?`, [DNI], (errClient, clienteRow) => {
      if (errClient) console.error('realizarCompra obtener cliente:', errClient);

      const ahora = new Date();
      if (clienteRow && clienteRow.Descuento_Porcentaje > 0 && clienteRow.Descuento_Vencimiento) {
        const venc = new Date(clienteRow.Descuento_Vencimiento);
        if (venc > ahora) {
          const desc = clienteRow.Descuento_Porcentaje;
          totalCompra = Number((totalCompra * (1 - desc / 100)).toFixed(2));
          // invalidar descuento usado
          db.run(`UPDATE Cliente SET Descuento_Porcentaje = 0, Descuento_Vencimiento = NULL WHERE DNI = ?`, [DNI], err => {
            if (err) console.error('Error invalidando descuento tras uso:', err);
          });
        } else {
          // limpiar vencido
          db.run(`UPDATE Cliente SET Descuento_Porcentaje = 0, Descuento_Vencimiento = NULL WHERE DNI = ?`, [DNI], err => {
            if (err) console.error('Error limpiando descuento vencido:', err);
          });
        }
      }

      // verificar stock
      const productIds = Object.keys(qtyByProduct);
      if (productIds.length === 0) return res.status(400).json({ Error: 'Carrito no contiene productos válidos.' });

      const placeholders = productIds.map(() => '?').join(',');
      db.all(`SELECT ID_Producto, Stock FROM Productos WHERE ID_Producto IN (${placeholders})`, productIds, (errProd, prodRows) => {
        if (errProd) {
          console.error('realizarCompra stock query:', errProd);
          return res.status(500).json({ Error: 'Error al verificar stock.' });
        }

        for (const pr of prodRows) {
          const need = qtyByProduct[pr.ID_Producto] || 0;
          if (pr.Stock == null || pr.Stock < need) {
            return res.status(400).json({ Error: `Stock insuficiente para producto ID ${pr.ID_Producto}.` });
          }
        }

        // persistir compra
        const descripcion = JSON.stringify({
          Nombre, Apellido, Email, Telefono,
          Direccion: Direccion || '', Ciudad: Ciudad || '', Provincia: Provincia || '',
          CodigoPostal: CodigoPostal || '', Pais: Pais || 'Argentina',
          DatosPago: DatosPago || {}
        });

        db.run(`INSERT INTO Compras (DNI, Fecha_Compra, Total, Tipo_Envio, Descripcion) VALUES (?, ?, ?, ?, ?)`,
          [DNI, new Date().toISOString(), totalCompra, Tipo_Envio, descripcion],
          function (Error) {
            if (Error) {
              console.error('realizarCompra insertar compra:', Error);
              return res.status(500).json({ Error: 'Error al crear compra.' });
            }
            const ID_Compra = this.lastID;

            // crear facturacion
            const costoEnvio = (Tipo_Envio === 'Retiro en Sucursal') ? 0 : (Tipo_Envio === 'Envío Express' ? 5000 : 3000);
            db.run(`INSERT INTO Facturacion (Id_Compra, Fecha_Compra, Metodo_Pago, DNI, Tipo_Envio, Costo_Envio) VALUES (?, ?, ?, ?, ?, ?)`,
              [ID_Compra, new Date().toISOString(), Metodo_Pago, DNI, Tipo_Envio, costoEnvio], (errF) => {
                if (errF) console.error('realizarCompra facturacion:', errF);
              });

            // detalles de compra y decremento de stock
            carrito.forEach(item => {
              db.get(`SELECT Precio FROM Productos WHERE ID_Producto = ?`, [item.ID_Producto], (errP, prodRow) => {
                const precioUnitario = (prodRow && prodRow.Precio) ? prodRow.Precio : item.Total;
                db.run(`INSERT INTO Detalles_Compra (ID_Compra, ID_Producto, Cantidad, PrecioUnitario) VALUES (?, ?, ?, ?)`,
                  [ID_Compra, item.ID_Producto, 1, precioUnitario], (errIns) => {
                    if (errIns) console.error('realizarCompra insertar detalle:', errIns);
                  });
              });
            });

            // decrementar stock
            Object.keys(qtyByProduct).forEach(pid => {
              db.run(`UPDATE Productos SET Stock = Stock - ? WHERE ID_Producto = ?`, [qtyByProduct[pid], pid], errU => {
                if (errU) console.error('realizarCompra decrementar stock:', errU);
              });
            });

            // limpiar carrito
            db.run(`DELETE FROM Carrito WHERE DNI = ?`, [DNI], errDel => { if (errDel) console.error('realizarCompra limpiar carrito:', errDel); });

            // si hace falta crear registro en Envios
            db.run(`INSERT INTO Envios (ID_Compra, Tipo_Envio, Direccion, Cod_Postal, Estado) VALUES (?, ?, ?, ?, ?)`,
              [ID_Compra, Tipo_Envio, Direccion || '', CodigoPostal || '', 'Pendiente'], errEnv => {
                if (errEnv) console.error('realizarCompra crear envio:', errEnv);
              });

            // actualizar datos del cliente opcionalmente
            const updateFields = [];
            const updateValues = [];
            if (Direccion || Ciudad || Provincia) {
              const direccionCompleta = [Direccion, Ciudad, Provincia].filter(Boolean).join(', ');
              updateFields.push('Direccion = ?'); updateValues.push(direccionCompleta);
            }
            if (CodigoPostal) {
              updateFields.push('Cod_Postal = ?'); updateValues.push(CodigoPostal);
            }
            if (updateFields.length > 0) {
              updateValues.push(DNI);
              db.run(`UPDATE Cliente SET ${updateFields.join(', ')} WHERE DNI = ?`, updateValues, errUp => {
                if (errUp) console.error('realizarCompra actualizar cliente:', errUp);
              });
            }

            return res.json({ Mensaje: 'Compra realizada correctamente.', ID_Compra, Total: totalCompra });
          });
      });
    });
  });
};

// ver compras por cliente
const verComprasClientes = (req, res) => {
  const { DNI } = req.params;
  if (!DNI) return res.status(400).json({ Error: 'DNI requerido.' });

  db.all(`SELECT * FROM Compras WHERE DNI = ? ORDER BY Fecha_Compra DESC`, [DNI], (Error, filas) => {
    if (Error) {
      console.error('verComprasClientes:', Error);
      return res.status(500).json({ Error: 'Error al obtener compras.' });
    }
    res.json(filas || []);
  });
};

// ver todas (admin)
const obtenerTodasCompras = (req, res) => {
  db.all(`SELECT * FROM Compras ORDER BY Fecha_Compra DESC`, [], (Error, filas) => {
    if (Error) {
      console.error('obtenerTodasCompras:', Error);
      return res.status(500).json({ Error: 'Error al obtener compras.' });
    }
    res.json(filas || []);
  });
};

// actualizar estado de envío -> ACTUALIZA LA TABLA Envios (no Compras)
const actualizarEstadoEnvio = (req, res) => {
  const { ID_Envio, ID_Compra } = req.params; // permitimos ambos
  const { Estado_Envio } = req.body;
  if (!Estado_Envio) return res.status(400).json({ Error: 'Estado_Envio requerido.' });

  if (ID_Envio) {
    db.run(`UPDATE Envios SET Estado = ? WHERE ID_Envio = ?`, [Estado_Envio, ID_Envio], function (Error) {
      if (Error) {
        console.error('actualizarEstadoEnvio por ID_Envio:', Error);
        return res.status(500).json({ Error: 'Error al actualizar estado.' });
      }
      if (this.changes === 0) return res.status(404).json({ Error: 'Envio no encontrado.' });
      res.json({ Mensaje: 'Estado de envío actualizado.', Cambios: this.changes });
    });
  } else if (ID_Compra) {
    db.run(`UPDATE Envios SET Estado = ? WHERE ID_Compra = ?`, [Estado_Envio, ID_Compra], function (Error) {
      if (Error) {
        console.error('actualizarEstadoEnvio por ID_Compra:', Error);
        return res.status(500).json({ Error: 'Error al actualizar estado.' });
      }
      if (this.changes === 0) return res.status(404).json({ Error: 'Envio no encontrado para esa compra.' });
      res.json({ Mensaje: 'Estado de envío actualizado.', Cambios: this.changes });
    });
  } else {
    return res.status(400).json({ Error: 'ID_Envio o ID_Compra requerido en params.' });
  }
};

module.exports = {
  realizarCompra,
  verComprasClientes,
  obtenerTodasCompras,
  actualizarEstadoEnvio
};