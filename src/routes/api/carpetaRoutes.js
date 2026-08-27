const express = require('express');
const router = express.Router();
const carpetaController = require('../../controllers/carpetaController');

router.get('/', carpetaController.getCarpetas);
router.get('/:id', carpetaController.getCarpetaById);
router.post('/', carpetaController.createCarpeta);
router.put('/:id', carpetaController.updateCarpeta);
router.delete('/:id', carpetaController.deleteCarpeta);

module.exports = router;
