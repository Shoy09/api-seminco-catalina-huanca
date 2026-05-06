const express = require('express');
const router = express.Router();
const pernosController = require('../../controllers/pernosController');
const verificarToken = require('../../middleware/auth');

// GET
router.get('/', verificarToken, pernosController.getAll);

// POST
router.post('/', verificarToken, pernosController.create);

// PUT
router.put('/:id', verificarToken, pernosController.update);

// DELETE
router.delete('/:id', verificarToken, pernosController.delete);

module.exports = router;