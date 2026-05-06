const express = require('express');
const router = express.Router();
const medicionesHorizontalController = require('../../controllers/medicionesHorizontalController');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, medicionesHorizontalController.getAllMedicionesHorizontal);

router.get('/', verificarToken, medicionesHorizontalController.getMedicionesConRemanente);

router.get('/:id', verificarToken, medicionesHorizontalController.getMedicionHorizontalById);

router.post('/', medicionesHorizontalController.createMedicionHorizontal);

router.put('/:id', verificarToken, medicionesHorizontalController.updateMedicionHorizontal);

router.delete('/:id', verificarToken, medicionesHorizontalController.deleteMedicionHorizontal);

module.exports = router;
