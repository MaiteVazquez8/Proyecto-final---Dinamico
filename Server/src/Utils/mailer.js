const nodemailer = require('nodemailer');
const fs = require('fs');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ 1. Confirmación de cuenta
async function enviarCorreoValidacion(email, nombre, token) {
  const link = `http://localhost:3000/verificar/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmá tu cuenta",
    html: `
      <h2>Hola ${nombre}</h2>
      <p>Para finalizar tu registro, hacé click aquí:</p>
      <a href="${link}">Confirmar cuenta</a>
    `
  });
}

// 🎁 2. Descuento 10% por registro
async function enviarCorreoBienvenida(email, nombre, porcentaje, dias) { 
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎁 Tenés 10% OFF en tu primera compra",
    html: `
      <h2>Bienvenido ${nombre}</h2>
      <p>Se te habilitó un <b>${porcentaje}% de descuento</b> en tu próxima compra.</p>
      <p>Válido por ${dias} días.</p>
    `
  });
}

// 🔐 3. Solicitud cambio contraseña (Primer paso: Confirmación de identidad)
async function enviarCorreoConfirmacionCambio(email, nombre, token) {
  const link = `http://localhost:3000/confirmar-restablecimiento/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "¿Deseás cambiar tu contraseña? (Confirmación Requerida)",
    html: `
      <p>Hola ${nombre}, solicitaste cambiar tu contraseña.</p>
      <p>Haz clic en el enlace de abajo para confirmar que fuiste tú y recibir el token final:</p>
      <a href="${link}">Confirmar solicitud y obtener token</a>
    `
  });
}

// 🔑 4. Token reset (Segundo paso: Ingresar token y nueva contraseña)
async function enviarCorreoRecuperacion(email, token) {
   const link = `http://localhost:3000/ingresar-token-y-pass?token=${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Token para cambiar contraseña",
    html: `
      <p>Tu token de seguridad es: <h2>${token}</h2></p>
      <p>Ingresa tu nueva contraseña y este token en la siguiente página:</p>
      <a href="${link}">Ingresar nueva contraseña</a>
    `
  });
}

// 🎂 5. Cumpleaños 15%
async function enviarCorreoCumpleaños(nombre, email) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎂 Feliz Cumpleaños",
    html: `
      <h2>🎉 Feliz cumpleaños ${nombre}</h2>
      <p>Te regalamos un <b>15% de descuento</b> válido por 30 días.</p>
    `
  });
}

// 📨 6. Avisos generales (Nuevo, usado por EnvioAvisos.Controller.js)
async function enviarAvisoMail(emails, asunto, mensaje) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: Array.isArray(emails) ? emails.join(',') : emails, // Maneja un solo mail o un array
    subject: asunto,
    html: `<p>${mensaje}</p>`
  });
}


// 🧾 7. Factura HTML + PDF (Tu función original, ahora definida correctamente)
async function EnviarFacturaCompra({ Nombre, Email, CompraID, Total, Productos }) {

  const html = `
    <h2>Factura de Compra #${CompraID}</h2>
    <p>Cliente: ${Nombre}</p>
    <p>Total: $${Total}</p>
    <ul>
      ${Productos.map(p => `<li>${p.Nombre} - $${p.Precio}</li>`).join("")}
    </ul>
  `;

  // PDF
  const pdfPath = `factura_${CompraID}.pdf`;
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(pdfPath));
  doc.text(`Factura #${CompraID}`);
  doc.text(`Cliente: ${Nombre}`);
  doc.text(`Total: $${Total}`);
  Productos.forEach(p => {
    doc.text(`${p.Nombre} - $${p.Precio}`);
  });
  doc.end();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: Email,
    subject: "🧾 Factura de tu compra",
    html,
    attachments: [
      {
        filename: `Factura_${CompraID}.pdf`,
        path: pdfPath
      }
    ]
  });
}


module.exports = {
  enviarCorreoValidacion,
  enviarCorreoBienvenida,
  enviarCorreoConfirmacionCambio,
  enviarCorreoRecuperacion,
  enviarCorreoCumpleaños,
  enviarAvisoMail,
  EnviarFacturaCompra // Ahora sí está definida y exportada correctamente
};