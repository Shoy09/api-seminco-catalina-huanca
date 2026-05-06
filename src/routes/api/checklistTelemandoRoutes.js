const express = require('express');
const router = express.Router();
const checklistTelemandoController = require('../../controllers/checklistTelemandoController');
const verificarToken = require('../../middleware/auth');

// Rutas para checklist telemando
router.get('/', verificarToken, checklistTelemandoController.getAll);
router.get('/:id', verificarToken, checklistTelemandoController.getById);
router.post('/', verificarToken, checklistTelemandoController.create);
router.put('/:id', verificarToken, checklistTelemandoController.update);
router.delete('/:id', verificarToken, checklistTelemandoController.delete);

module.exports = router;