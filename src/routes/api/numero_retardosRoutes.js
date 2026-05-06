const express = require('express');
const router = express.Router();
const numeroRetardosController = require('../../controllers/numero_retardosController');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, numeroRetardosController.getAll);
router.get('/ultimo', verificarToken, numeroRetardosController.getLast);
router.get('/anio/:anio', verificarToken, numeroRetardosController.getByAnio);

router.post('/', verificarToken, numeroRetardosController.create);
router.put('/:id', verificarToken, numeroRetardosController.update);
router.delete('/:id', verificarToken, numeroRetardosController.delete);

module.exports = router;