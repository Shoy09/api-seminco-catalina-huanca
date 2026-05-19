const express = require('express');
const router = express.Router();

const guardiaController = require('../../controllers/guardiaController');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, guardiaController.getAllGuardias);

router.get('/:id', verificarToken, guardiaController.getGuardiaById);

router.post('/', verificarToken, guardiaController.createGuardia);

router.put('/:id', verificarToken, guardiaController.updateGuardia);

router.delete('/:id', verificarToken, guardiaController.deleteGuardia);

module.exports = router;