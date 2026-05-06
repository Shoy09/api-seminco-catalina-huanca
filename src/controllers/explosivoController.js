const Explosivo = require('../models/Explosivo');

// Obtener todos los explosivos
exports.getAllExplosivos = async (req, res) => {
    try {
        const explosivos = await Explosivo.findAll();
        res.json(explosivos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener explosivos' });
    }
};

// Obtener un explosivo por ID
exports.getExplosivoById = async (req, res) => {
    try {
        const explosivo = await Explosivo.findByPk(req.params.id);
        if (!explosivo) return res.status(404).json({ error: 'Explosivo no encontrado' });
        res.json(explosivo);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el explosivo' });
    }
};

// Crear un explosivo
exports.createExplosivo = async (req, res) => {
    try {
        const nuevoExplosivo = await Explosivo.create(req.body);
        res.status(201).json(nuevoExplosivo);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el explosivo' });
    }
};

// Actualizar un explosivo
exports.updateExplosivo = async (req, res) => {
    try {
        const explosivo = await Explosivo.findByPk(req.params.id);
        if (!explosivo) return res.status(404).json({ error: 'Explosivo no encontrado' });

        await explosivo.update(req.body);
        res.json(explosivo);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el explosivo' });
    }
};

// Eliminar un explosivo
exports.deleteExplosivo = async (req, res) => {
    try {
        const explosivo = await Explosivo.findByPk(req.params.id);
        if (!explosivo) return res.status(404).json({ error: 'Explosivo no encontrado' });

        await explosivo.destroy();
        res.json({ message: 'Explosivo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el explosivo' });
    }
};
