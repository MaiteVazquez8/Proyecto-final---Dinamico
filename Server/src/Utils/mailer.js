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

    <!-- CÓDIGO DE VALIDACIÓN DESTACADO -->
    <div style="text-align: center; margin: 30px 20px;">
      <div style="
        background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
        border-radius: 10px;
        padding: 30px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      ">
        <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">
          Tu Código de Validación
        </p>
        <div style="
          background: #ffffff;
          border-radius: 8px;
          padding: 15px 10px;
          margin: 10px 0;
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-all;
        ">
          <p style="
            font-size: 24px;
            font-weight: bold;
            color: #2d3748;
            margin: 0;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
            line-height: 1.4;
          ">
            ${textoCentral}
          </p>
        </div>
        <p style="color: #ffffff; font-size: 12px; margin: 10px 0 0 0;">
          Válido por 15 minutos
        </p>
      </div>
    </div>

    <!-- IMAGEN CENTRAL (decorativa) -->
    <div style="text-align: center; margin: 25px auto;">
      <img src="cid:mainImage" alt="Imagen" style="max-width: 400px; width: 100%; display: block; margin: 0 auto;">
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
      { filename: "headersi.jpg", path: "src/assets/footer/header/headersi.jpg", cid: "headerImage" },
      { filename: "ticket-vacio.png", path: "src/assets/cupon/ticket-vacio2.png", cid: "mainImage" },
      { filename: "footer.jpg", path: "src/assets/footer/header/footer.jpg", cid: "footerImage" }
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
      { filename: "headersi.jpg", path: "src/assets/footer/header/headersi.jpg", cid: "headerImage" },
      { filename: "password.png", path: "src/assets/pswrd/contraseña.png", cid: "mainImage" },
      { filename: "footer.jpg", path: "src/assets/footer/header/footer.jpg", cid: "footerImage" }
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
      { filename: "headersi.jpg", path: "src/assets/footer/header/headersi.jpg", cid: "headerImage" },
      { filename: "ticket-10.png", path: "src/assets/cupon/ticket-10.png", cid: "mainImage" },
      { filename: "footer.jpg", path: "src/assets/footer/header/footer.jpg", cid: "footerImage" }
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
      { filename: "headersi.jpg", path: "src/assets/footer/header/headersi.jpg", cid: "headerImage" },
      { filename: "footer.jpg", path: "src/assets/footer/header/footer.jpg", cid: "footerImage" }
    ]
  });
}

module.exports = {
  enviarCorreoValidacion,
  enviarCorreoRecuperacion,
  enviarCorreoBienvenida,
  enviarAvisoMail
};