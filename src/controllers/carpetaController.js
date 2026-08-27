const Carpeta = require('../models/Carpeta');
const verificarToken = require('../middleware/auth');

// GET - Obtener todas las carpetas
exports.getCarpetas = [
    verificarToken,
    async (req, res) => {
        try {
            const carpetas = await Carpeta.findAll({ order: [['createdAt', 'DESC']] });
            res.json(carpetas);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener las carpetas' });
        }
    }
];

// GET - Obtener una carpeta por ID
exports.getCarpetaById = [
    verificarToken,
    async (req, res) => {
        try {
            const carpeta = await Carpeta.findByPk(req.params.id);
            if (!carpeta) {
                return res.status(404).json({ error: 'Carpeta no encontrada' });
            }
            res.json(carpeta);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener la carpeta' });
        }
    }
];

// POST - Crear carpeta
exports.createCarpeta = [
    verificarToken,
    async (req, res) => {
        try {
            const { nombre } = req.body;
            if (!nombre) {
                return res.status(400).json({ error: 'El nombre es requerido' });
            }
            const carpeta = await Carpeta.create({ nombre });
            res.status(201).json({ message: 'Carpeta creada correctamente', carpeta });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear la carpeta' });
        }
    }
];

// PUT - Actualizar carpeta
exports.updateCarpeta = [
    verificarToken,
    async (req, res) => {
        try {
            const carpeta = await Carpeta.findByPk(req.params.id);
            if (!carpeta) {
                return res.status(404).json({ error: 'Carpeta no encontrada' });
            }
            const { nombre } = req.body;
            await carpeta.update({ nombre });
            res.json({ message: 'Carpeta actualizada correctamente', carpeta });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar la carpeta' });
        }
    }
];

// DELETE - Eliminar carpeta
exports.deleteCarpeta = [
    verificarToken,
    async (req, res) => {
        try {
            const carpeta = await Carpeta.findByPk(req.params.id);
            if (!carpeta) {
                return res.status(404).json({ error: 'Carpeta no encontrada' });
            }
            await carpeta.destroy();
            res.json({ message: 'Carpeta eliminada correctamente' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar la carpeta' });
        }
    }
];
