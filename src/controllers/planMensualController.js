const PlanMensual = require('../models/PlanMensual');

// Obtener todos los registros
const getAllPlanMensual = async (req, res) => {
    try {
        const planes = await PlanMensual.findAll();
        res.status(200).json(planes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los planes mensuales', error });
    }
};

// Obtener un registro por ID
const getPlanMensualById = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await PlanMensual.findByPk(id);
        if (!plan) {
            return res.status(404).json({ message: 'Plan mensual no encontrado' });
        }
        res.status(200).json(plan);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el plan mensual', error });
    }
};

// Crear un nuevo registro
const createPlanMensual = async (req, res) => {
    try {
        const newPlan = await PlanMensual.create(req.body);
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el plan mensual', error });
    }
};

// Actualizar un registro por ID
const updatePlanMensual = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await PlanMensual.update(req.body, { where: { id } });

        if (updated) {
            const updatedPlan = await PlanMensual.findByPk(id);
            return res.status(200).json(updatedPlan);
        }

        res.status(404).json({ message: 'Plan mensual no encontrado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el plan mensual', error });
    }
};

// Eliminar un registro por ID
const deletePlanMensual = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await PlanMensual.destroy({ where: { id } });

        if (deleted) {
            return res.status(200).json({ message: 'Plan mensual eliminado correctamente' });
        }

        res.status(404).json({ message: 'Plan mensual no encontrado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el plan mensual', error });
    }
};

const getPlanMensualByYearAndMonth = async (req, res) => {
    try {
        const { anio, mes } = req.params; // Obtener los parámetros desde la URL
        const planes = await PlanMensual.findAll({
            where: {
                anio: anio,
                mes: mes
            }
        });
  
        if (!planes || planes.length === 0) {
            return res.status(404).json({ message: 'Planes mensuales no encontrados' });
        }
  
        res.status(200).json(planes);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los planes mensuales', error });
    }
  };

module.exports = {
    getAllPlanMensual,
    getPlanMensualById,
    createPlanMensual,
    updatePlanMensual,
    deletePlanMensual,
    getPlanMensualByYearAndMonth
};
