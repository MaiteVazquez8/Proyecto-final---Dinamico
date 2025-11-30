// src/Utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ===========================================================
   GENERADOR DE PLANTILLA GENERAL PARA TODOS LOS MAILS
   =========================================================== */
function plantillaMail({ titulo, mensaje, textoCentral }) {
  return `
  <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; background: #ffffff; padding: 0;">

    <!-- HEADER -->
    <img src="cid:headerImage" style="width: 100%; display: block;" alt="Header">

    <!-- TITULO -->
    <h2 style="text-align: center; color: #333; margin-top: 25px;">
      ${titulo}
    </h2>

    <!-- TEXTO EXPLICATIVO -->
    <p style="text-align: center; color: #444; font-size: 16px; padding: 0 20px;">
      ${mensaje}
    </p>

    <!-- IMAGEN CENTRAL + TEXTO CENTRADO -->
    <div style="position: relative; width: 100%; max-width: 600px; margin: 25px auto;">
      <img src="cid:mainImage" alt="Imagen" style="width: 100%; display: block;">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 48px;
        font-weight: bold;
        color: white;
        text-shadow: 2px 2px 6px black;
        letter-spacing: 3px;
      ">
        ${textoCentral}
      </div>
    </div>

    <!-- FOOTER -->
    <img src="cid:footerImage" style="width: 100%; display: block;" alt="Footer">

  </div>
  `;
}

/* ===========================================================
   ENVIAR VALIDACIÓN DE CUENTA
   =========================================================== */
async function enviarCorreoValidacion(email, nombre, token) {
  const html = plantillaMail({
    titulo: "Validación de Cuenta",
    mensaje: `Hola <strong>${nombre || ''}</strong>, gracias por registrarte.<br>
              Este es tu código de validación. Válido por 15 minutos.`,
    textoCentral: token
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Validación de cuenta",
    html,
    attachments: [
      { filename: "header.png", path: "src/assets/header.png", cid: "headerImage" },
      { filename: "ticket-vacio.png", path: "src/assets/ticket-vacio.png", cid: "mainImage" },
      { filename: "footer.png", path: "src/assets/footer.png", cid: "footerImage" }
    ]
  });
}

/* ===========================================================
   ENVIAR RECUPERACIÓN DE CONTRASEÑA
   =========================================================== */
async function enviarCorreoRecuperacion(email, nombre, token) {
  const html = plantillaMail({
    titulo: "Recuperación de Contraseña",
    mensaje: `Hola <strong>${nombre || ''}</strong>, solicitaste recuperar tu contraseña.<br>
              Usa el siguiente token. Válido por 10 minutos.`,
    textoCentral: token
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Recuperación de contraseña",
    html,
    attachments: [
      { filename: "header.png", path: "src/assets/header.png", cid: "headerImage" },
      { filename: "main-bg.png", path: "src/assets/main-bg.png", cid: "mainImage" },
      { filename: "footer.png", path: "src/assets/footer.png", cid: "footerImage" }
    ]
  });
}

/* ===========================================================
   ENVIAR BIENVENIDA + PORCENTAJE
   =========================================================== */
async function enviarCorreoBienvenida(email, nombre, porcentaje = 10, dias = 30) {
  const html = plantillaMail({
    titulo: "¡Bienvenido a ElectroShop!",
    mensaje: `Hola <strong>${nombre || ''}</strong>!<br>
              Te regalamos un <strong>${porcentaje}%</strong> de descuento válido por <strong>${dias} días</strong>.<br>
              Se aplicará automáticamente en tu primera compra.`,
    textoCentral: `${porcentaje}%`
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Bienvenido - Descuento especial",
    html,
    attachments: [
      { filename: "header.png", path: "src/assets/header.png", cid: "headerImage" },
      { filename: "main-bg.png", path: "src/assets/main-bg.png", cid: "mainImage" },
      { filename: "footer.png", path: "src/assets/footer.png", cid: "footerImage" }
    ]
  });
}

/* ===========================================================
   AVISOS GENERALES (SIN PORTADA CENTRAL)
   =========================================================== */
async function enviarAvisoMail(emails, asunto, mensaje) {
  const to = Array.isArray(emails) ? emails.join(',') : emails;

  const html = `
    <div style="max-width: 600px; margin: auto; font-family: Arial;">
      <img src="cid:headerImage" style="width: 100%; display: block;">
      <p style="padding: 20px; color: #444; font-size: 16px;">${mensaje}</p>
      <img src="cid:footerImage" style="width: 100%; display: block;">
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: asunto,
    html,
    attachments: [
      { filename: "header.png", path: "src/assets/header.png", cid: "headerImage" },
      { filename: "footer.png", path: "src/assets/footer.png", cid: "footerImage" }
    ]
  });
}

module.exports = {
  enviarCorreoValidacion,
  enviarCorreoRecuperacion,
  enviarCorreoBienvenida,
  enviarAvisoMail
};