const express = require('express');
const router = express.Router();
const mallasController = require('../../controllers/mallasController');
const verificarToken = require('../../middleware/auth');

// GET
router.get('/', verificarToken, mallasController.getAll);

// POST
router.post('/', verificarToken, mallasController.create);

// PUT
router.put('/:id', verificarToken, mallasController.update);

// DELETE
router.delete('/:id', verificarToken, mallasController.delete);

module.exports = router;