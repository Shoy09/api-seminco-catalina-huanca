const express = require('express');
const router = express.Router();
const usuarioController = require('../../controllers/UsuarioController');

router.get('/usuarios', usuarioController.obtenerUsuarios);

router.get('/operadores', usuarioController.obtenerOperadores);

router.get('/usuarios/:id', usuarioController.obtenerUsuarioPorId);

router.get('/guardia', usuarioController.obtenerJefesGuardia);

router.post('/usuarios', usuarioController.crearUsuario);

router.post('/usuarios/bulk', usuarioController.crearUsuariosBulk);

router.put('/usuarios/:id/operaciones', usuarioController.actualizarOperacionesAutorizadas);

router.put('/usuarios/:id', usuarioController.actualizarUsuario);

router.delete('/usuarios/:id', usuarioController.eliminarUsuario);

router.get('/perfil', usuarioController.obtenerPerfil);

router.put('/usuarios/:id/firma', usuarioController.actualizarFirma);

module.exports = router;
 