const express = require('express');
const router = express.Router();
const toneladasScoopController = require('../../controllers/ToneladasScoop');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, toneladasScoopController.getAllToneladasScoops);
router.get('/:id', verificarToken, toneladasScoopController.getToneladasScoopById);
router.post('/', verificarToken, toneladasScoopController.createToneladasScoop);
router.put('/:id', verificarToken, toneladasScoopController.updateToneladasScoop);
router.delete('/:id', verificarToken, toneladasScoopController.deleteToneladasScoop);

module.exports = router;