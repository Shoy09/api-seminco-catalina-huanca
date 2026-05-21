const express = require('express');
const router = express.Router();
const materialController = require('../../controllers/material.controller');
const verificarToken = require('../../middleware/auth');

router.get('/', verificarToken, materialController.getAllMateriales);
router.get('/:id', verificarToken, materialController.getMaterialById);
router.post('/', verificarToken, materialController.createMaterial);
router.put('/:id', verificarToken, materialController.updateMaterial);
router.delete('/:id', verificarToken, materialController.deleteMaterial);

module.exports = router;