const express = require('express');
const router = express.Router();
const controller = require('../../controllers/operaciones');
const verificarToken = require('../../middleware/auth');


router.get('/horometros/ultimos', verificarToken, controller.obtenerUltimosHorometros);
router.get('/:tipo/id/:id', verificarToken, controller.obtenerPorId);
router.get('/:tipo/jefe', verificarToken, controller.obtenerPorJefe);
router.post('/crear', controller.crear);
router.get('/:tipo', verificarToken, controller.obtener);
router.get('/aprobacion/:tipo', verificarToken, controller.obtenerPorAprobacion);
router.put('/update/:tipo/:id', controller.actualizar);

module.exports = router;