const express = require('express');
const router = express.Router();
const estadoController = require('../../controllers/estadoController');
const verificarToken = require('../../middleware/auth');

// Rutas protegidas con el middleware verificarToken
router.get('/', verificarToken, estadoController.getAllEstados);
router.get('/:id', verificarToken, estadoController.getEstadoById);
router.post('/', verificarToken, estadoController.createEstado);
router.put('/:id', verificarToken, estadoController.updateEstado);
router.delete('/:id', verificarToken, estadoController.deleteEstado);
router.get('/proceso/:proceso', verificarToken, estadoController.getEstadosByProceso);

module.exports = router;
