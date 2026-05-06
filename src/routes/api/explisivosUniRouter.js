const express = require('express');
const router = express.Router();
const explisivosUniController = require('../../controllers/explisivosUniController'); // Asegúrate de que la ruta al controlador sea correcta
const verificarToken = require('../../middleware/auth');

// Rutas para Explisivos_uni
router.post('/', verificarToken, explisivosUniController.create); // Crear un nuevo registro
router.get('/', verificarToken, explisivosUniController.findAll); // Obtener todos los registros
router.get('/:id', verificarToken, explisivosUniController.findOne); // Obtener un registro por ID
router.put('/:id', verificarToken, explisivosUniController.update); // Actualizar un registro por ID
router.delete('/:id', verificarToken, explisivosUniController.delete); // Eliminar un registro por ID

module.exports = router;