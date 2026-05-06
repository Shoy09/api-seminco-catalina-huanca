const express = require('express');
const router = express.Router();
const seccionController = require('../../controllers/SeccionController');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, seccionController.getAll);
router.post('/', verificarToken, seccionController.create);
router.put('/:id', verificarToken, seccionController.update);
router.delete('/:id', verificarToken, seccionController.delete);
router.get('/proceso/:proceso', verificarToken, seccionController.getByProceso);

module.exports = router;