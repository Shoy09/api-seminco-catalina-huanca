const express = require('express');
const router = express.Router();


const usuariosRoutes = require('../routes/api/UsuarioRoutes');
const authRoutes = require('../routes/api/authRoutes');
const equipoRoutes = require('../routes/api/equipoRoutes');
const estadoRoutes = require('../routes/api/estadoRoutes');
const PlamMensual = require('../routes/api/planMensualRoutes');
const TipoPerfpo = require('../routes/api/tipoPerforacionRoutes');
const PlanMetraje = require('../routes/api/planMetrajeRoutes');
const PlanProduccion = require('../routes/api/planProduccionRoutes');
const fechasplanmensual = require('../routes/api/fechasPlanMensualroutes');
const Checklist = require('../routes/api/checklistItemRoutes');
const tipoEquipoRoutes = require('../routes/api/tipoEquipoRoutes');
const checklistTelemandoRoutes = require('../routes/api/checklistTelemandoRoutes');
const seccionRoutes = require('../routes/api/SeccionRuta');
const operacionesRoutes = require('../routes/api/operaciones');
const longitudBarrasRoutes = require('../routes/api/longitudBarrasRoutes');
const pernosRoutes = require('../routes/api/pernosRoutes');
const mallasRoutes = require('../routes/api/mallasRoutes');
const origenDestinoRoutes = require('../routes/api/origenDestinoRoutes');
const Explosivo = require('../routes/api/explosivoRoutes');
const Accesorio = require('../routes/api/accesorioRoutes');
const ExploUni = require('../routes/api/explisivosUniRouter');
const NubeDatosTrabajoExploraciones = require('../routes/api/NubeDatosTrabajoExploracionesRoutes');
const mediHorizontal = require('../routes/api/medicionesHorizontalRoutes');
const numeroRetardo = require('../routes/api/numero_retardosRoutes');
const guardiasRutes = require('../routes/api/guardias');
const materialRoutes = require('../routes/api/MaterialRoutes');
const empresaRoutes = require('../routes/api/EmpresaRoutes');
const toneladasScoopRoutes = require('../routes/api/ToneladasScoopsRoutes');
const scimRoutes  = require('../routes/api/scimRoutes');
const testEmail = require('../services/testEmail');
router.use('/usuarios', usuariosRoutes);  
//router.use('/auth', authRoutes);  

router.use('/Equipo', equipoRoutes);  
router.use('/estado', estadoRoutes);  
router.use('/TipoPerfpo', TipoPerfpo);  
router.use('/PlanMensual', PlamMensual);  
router.use('/PlanMetraje', PlanMetraje);  
router.use('/PlanProduccion', PlanProduccion); 
router.use('/fechas-plan-mensual', fechasplanmensual)
router.use('/check-list', Checklist); 
router.use('/tipo-equipos', tipoEquipoRoutes); 
router.use('/checklists-telemando', checklistTelemandoRoutes);
router.use('/secciones', seccionRoutes);
router.use('/operaciones', operacionesRoutes);
router.use('/longitud-barras', longitudBarrasRoutes);
router.use('/pernos', pernosRoutes);
router.use('/mallas', mallasRoutes);
router.use('/origen-destino', origenDestinoRoutes);
router.use('/Accesorios', Accesorio); 
router.use('/Explo-uni', ExploUni); 
router.use('/Explosivos', Explosivo);  
router.use('/NubeDatosExploraciones', NubeDatosTrabajoExploraciones);  
router.use('/medicion-tal-horizontal', mediHorizontal); 
router.use('/n-retardos', numeroRetardo); 
router.use('/guardias', guardiasRutes);
router.use('/materiales', materialRoutes);
router.use('/empresas', empresaRoutes);
router.use('/toneladas-scoops', toneladasScoopRoutes);

router.use('/test', testEmail);

 
// ── SCIM: EntraID llama a estos endpoints para crear/actualizar/desactivar usuarios
// URL base a configurar en Azure: https://tuapp.com/api/scim/v2
router.use('/scim/v2', scimRoutes);

module.exports = router;
   