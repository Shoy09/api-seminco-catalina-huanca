const express = require('express');
const path = require('path');

const router = express.Router();

const { enviarCorreo } = require('../services/mailer');

router.post('/email', async (req, res) => {

    try {

        await enviarCorreo({

            to: process.env.SMTP_USER,

            subject: 'Correo con PDF adjunto',

            html: `
                <h1>Hola</h1>
                <p>Te envío el reporte operativo en PDF adjunto.</p>
            `,

            attachments: [
                {
                    filename: 'resumen-operativo.pdf',
                    path: path.join(
                        __dirname,
                        '../pdf/resumen-operativo-2026-07-02_13-38.pdf'
                    )
                }
            ]

        });

        return res.json({
            ok: true,
            mensaje: 'Correo con PDF enviado correctamente.'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            ok: false,
            mensaje: 'No se pudo enviar el correo.',
            error: error.message
        });

    }

});

module.exports = router;