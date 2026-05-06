const express = require('express');
const router = express.Router();
const tipoEquipoController = require('../../controllers/tipoEquipoController');

// Obtener todos los tipos de equipo
router.get('/', tipoEquipoController.getAll);


// Crear un nuevo tipo de equipo
router.post('/', tipoEquipoController.create);

// Actualizar un tipo de equipo
router.put('/:id', tipoEquipoController.update);

// Eliminar un tipo de equipo
router.delete('/:id', tipoEquipoController.delete);

module.exports = router;