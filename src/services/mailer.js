const nodemailer = require('nodemailer');
const config = require('../config/mail');

const transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: config.auth,
});

async function sendMail({ to, subject, text, html }) {
  return transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });
}

async function verifyConnection() {
  try {
    await transporter.verify();
    console.log('✅ SMTP conectado correctamente');
  } catch (err) {
    console.error('❌ Error de conexión SMTP:', err.message);
    throw err;
  }
}

module.exports = {
  sendMail,
  verifyConnection,
};

module.exports = { sendMail };