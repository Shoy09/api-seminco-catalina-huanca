const express = require('express');
const router = express.Router();
const explosivoController = require('../../controllers/explosivoController');
const verificarToken = require('../../middleware/auth');

router.get('/',  explosivoController.getAllExplosivos);
router.get('/:id', verificarToken, explosivoController.getExplosivoById);
router.post('/', verificarToken, explosivoController.createExplosivo);
router.put('/:id', verificarToken, explosivoController.updateExplosivo);
router.delete('/:id', verificarToken, explosivoController.deleteExplosivo);

module.exports = router;
