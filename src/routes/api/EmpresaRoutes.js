const express = require('express');
const router = express.Router();
const empresaController = require('../../controllers/empresaController');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, empresaController.getAll);
router.get('/:id', verificarToken, empresaController.getById);
router.post('/', verificarToken, empresaController.create);
router.put('/:id', verificarToken, empresaController.update);
router.delete('/:id', verificarToken, empresaController.delete);

module.exports = router;