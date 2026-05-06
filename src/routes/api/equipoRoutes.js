const express = require('express');
const router = express.Router();
const equipoController = require('../../controllers/equipoController');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, equipoController.getAll);
router.post('/', verificarToken, equipoController.create);
router.put('/:id', verificarToken, equipoController.update);
router.delete('/:id', verificarToken, equipoController.delete);
router.get('/proceso/:proceso', verificarToken, equipoController.getByProceso);

module.exports = router;
