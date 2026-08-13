const express = require('express');
const multer = require('multer');
const { sendMail } = require('../../services/mailer');
const verificarToken = require('../../middleware/auth');

const router = express.Router();

// Todas las rutas de notificaciones requieren JWT
router.use(verificarToken);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Multer en memoria — guarda el archivo en buffer, no en disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // máximo 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

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

// POST /api/notificaciones/email-pdf
// Body: multipart/form-data con campos: to, subject, message (opcional) y archivo "pdf"
router.post('/email-pdf', upload.single('pdf'), async (req, res) => {
  const { to, subject, message } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ error: 'to y subject son requeridos' });
  }

  if (!emailRegex.test(to)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Se requiere un archivo PDF (campo "pdf")' });
  }

  try {
    const result = await sendMail({
      to,
      subject,
      text: message || '',
      html: message ? `<p>${message}</p>` : '',
      attachments: [
        {
          filename: req.file.originalname || 'adjunto.pdf',
          content: req.file.buffer,
          contentType: 'application/pdf',
        },
      ],
    });

    return res.json({ success: true, messageId: result.messageId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'No se pudo enviar el correo' });
  }
});

// Manejo de error de multer (ej. tipo de archivo incorrecto o tamaño excedido)
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message === 'Solo se permiten archivos PDF') {
    return res.status(400).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = router;