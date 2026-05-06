const express = require('express');
const router = express.Router();
const accesorioController = require('../../controllers/accesorioController');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, accesorioController.getAllAccesorios);
router.get('/:id', verificarToken, accesorioController.getAccesorioById);
router.post('/', verificarToken, accesorioController.createAccesorio);
router.put('/:id', verificarToken, accesorioController.updateAccesorio);
router.delete('/:id', verificarToken, accesorioController.deleteAccesorio);

module.exports = router;
