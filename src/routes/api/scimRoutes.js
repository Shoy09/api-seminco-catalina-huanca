
// Endpoints SCIM 2.0 que EntraID consume para aprovisionar usuarios automáticamente
 
const express    = require('express');
const router     = express.Router();
const scimCtrl   = require('../../controllers/scimController');
 
// Todas las rutas SCIM requieren el Bearer Token configurado en EntraID
router.use(scimCtrl.verificarScimToken);
 
// Configuración del proveedor (EntraID lo consulta primero)
router.get('/ServiceProviderConfig', scimCtrl.serviceProviderConfig);
 
// Recursos de Usuario
router.get('/Users',        scimCtrl.listarUsuarios);
router.get('/Users/:id',    scimCtrl.obtenerUsuario);
router.post('/Users',       scimCtrl.crearUsuario);
router.put('/Users/:id',    scimCtrl.reemplazarUsuario);
router.patch('/Users/:id',  scimCtrl.actualizarUsuario);
router.delete('/Users/:id', scimCtrl.eliminarUsuario);
 
module.exports = router;
 