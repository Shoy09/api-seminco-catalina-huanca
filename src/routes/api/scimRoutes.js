
// Endpoints SCIM 2.0 que EntraID consume para aprovisionar usuarios automáticamente

const express         = require('express');
const router          = express.Router();
const scimCtrl        = require('../../controllers/scimController');
const scimGroupCtrl   = require('../../controllers/scimGroupController');

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

// Recursos de Grupo (necesarios cuando Entra ID asigna usuarios vía grupos AD)
router.get('/Groups',        scimGroupCtrl.listarGrupos);
router.get('/Groups/:id',    scimGroupCtrl.obtenerGrupo);
router.post('/Groups',       scimGroupCtrl.crearGrupo);
router.put('/Groups/:id',    scimGroupCtrl.reemplazarGrupo);
router.patch('/Groups/:id',  scimGroupCtrl.actualizarGrupo);
router.delete('/Groups/:id', scimGroupCtrl.eliminarGrupo);

module.exports = router;
 