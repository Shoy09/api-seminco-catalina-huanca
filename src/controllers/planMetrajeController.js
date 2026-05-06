const PlanMetraje = require('../models/PlanMetraje');

// Obtener todos los registros
const getAllPlanMetraje = async (req, res) => {
    try {
        const planes = await PlanMetraje.findAll();
        res.status(200).json(planes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los planes de metraje', error });
    }
};
 
// Obtener un registro por ID
const getPlanMetrajeById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await PlanMetraje.findByPk(id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan de metraje no encontrado' });
        }
        res.status(200).json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el plan de metraje', error });
    }
};

// Crear un nuevo registro
const createPlanMetraje = async (req, res) => {
    try { 
        const newPlan = await PlanMetraje.create(req.body);
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el plan de metraje', error });
    }
};

// Actualizar un registro por ID
const updatePlanMetraje = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await PlanMetraje.update(req.body, { where: { id } });

        if (updated) {
            const updatedPlan = await PlanMetraje.findByPk(id);
            return res.status(200).json(updatedPlan);
        }

        res.status(404).json({ message: 'Plan de metraje no encontrado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el plan de metraje', error });
    }
};

// Eliminar un registro por ID
const deletePlanMetraje = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await PlanMetraje.destroy({ where: { id } });

        if (deleted) {
            return res.status(200).json({ message: 'Plan de metraje eliminado correctamente' });
        }

        res.status(404).json({ message: 'Plan de metraje no encontrado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plan de metraje', error });
    }
};

const getPlanMetrajeByYearAndMonth = async (req, res) => {
    try {
        const { anio, mes } = req.params; // Obtener los parámetros desde la URL

        // Realizar la consulta con los filtros para año y mes
        const planes = await PlanMetraje.findAll({
            where: {
                anio: anio,
                mes: mes
            }
        });

        // Verificar si no se encontraron resultados
        if (!planes || planes.length === 0) {
            return res.status(404).json({ message: 'Planes de metraje no encontrados' });
        }

        // Responder con los planes encontrados
        res.status(200).json(planes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los planes de metraje', error });
    }
};


module.exports = {
    getPlanMetrajeByYearAndMonth,
    getAllPlanMetraje,
    getPlanMetrajeById,
    createPlanMetraje,
    updatePlanMetraje,
    deletePlanMetraje
};
