// routes/pdfRoutes.js
const express = require('express');
const router = express.Router();
const pdfController = require('../../controllers/pdfController');

router.get('/', pdfController.getPdfs);
router.get('/carpeta/:carpeta_id', pdfController.getPdfsPorCarpeta);
router.post('/', pdfController.createPdf);
router.put('/:id', pdfController.updatePdf);
router.delete('/:id', pdfController.deletePdf);

module.exports = router;
