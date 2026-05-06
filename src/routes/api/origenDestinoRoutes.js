const express = require('express');
const router = express.Router();
const origenDestinoController = require('../../controllers/origenDestinoController');
const verificarToken = require('../../middleware/auth');

// 🔹 Rutas protegidas
router.get('/', verificarToken, origenDestinoController.getAll);
router.post('/', verificarToken, origenDestinoController.create);
router.put('/:id', verificarToken, origenDestinoController.update);
router.delete('/:id', verificarToken, origenDestinoController.delete);

module.exports = router;