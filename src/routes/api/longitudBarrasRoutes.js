const express = require('express');
const router = express.Router();
const longitudBarrasController = require('../../controllers/longitudBarrasController');
const verificarToken = require('../../middleware/auth');

// GET - listar
router.get('/', verificarToken, longitudBarrasController.getAll);

// POST - crear
router.post('/', verificarToken, longitudBarrasController.create);

// PUT - actualizar
router.put('/:id', verificarToken, longitudBarrasController.update);

// DELETE - eliminar
router.delete('/:id', verificarToken, longitudBarrasController.delete);

module.exports = router;