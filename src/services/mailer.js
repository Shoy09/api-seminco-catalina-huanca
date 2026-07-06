const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({

    host: process.env.SMTP_HOST,

    port: Number(process.env.SMTP_PORT),

    secure: process.env.SMTP_SECURE === 'true',

    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },

});

/**
 * Verifica la conexión SMTP al iniciar la aplicación.
 */
async function verificarSMTP() {

    await transporter.verify();

    console.log('[mailer] SMTP conectado correctamente.');

}

/**
 * Envía un correo.
 */
async function enviarCorreo({

    to,

    subject,

    html,

    attachments = [],

}) {

    const info = await transporter.sendMail({

        from: process.env.MAIL_FROM,

        to,

        subject,

        html,

        attachments,

    });

    console.log(`[mailer] Correo enviado. ID: ${info.messageId}`);

    return info;

}

module.exports = {

    enviarCorreo,

    verificarSMTP,

    transporter,

};