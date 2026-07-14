const express = require('express');
const { sendMail } = require('../../services/mailer');

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/email', async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({
      error: 'to, subject y message son requeridos',
    });
  }

  if (!emailRegex.test(to)) {
    return res.status(400).json({
      error: 'Email inválido',
    });
  }

  try {
    const result = await sendMail({
      to,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    });

    return res.json({
      success: true,
      messageId: result.messageId,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: 'No se pudo enviar el correo',
    });
  }
});

module.exports = router;