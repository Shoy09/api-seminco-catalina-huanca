const express = require('express');
const verificarToken = require('../../middleware/auth');
const {
    getAllPlanMensual,
    getPlanMensualById,
    createPlanMensual,
    updatePlanMensual,
    deletePlanMensual,
    getPlanMensualByYearAndMonth
} = require('../../controllers/planMensualController');

const router = express.Router();

router.get('/', verificarToken, getAllPlanMensual);
router.get('/:id', verificarToken, getPlanMensualById);
router.post('/', verificarToken, createPlanMensual);
router.put('/:id', verificarToken, updatePlanMensual);
router.delete('/:id', verificarToken, deletePlanMensual);
router.get('/anio/:anio/mes/:mes', verificarToken, getPlanMensualByYearAndMonth);

module.exports = router; 
