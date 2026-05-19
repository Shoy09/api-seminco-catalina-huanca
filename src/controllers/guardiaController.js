const Guardia = require('../models/Guardia');

// Obtener todas las guardias
exports.getAllGuardias = async (req, res) => {
    try {
        const guardias = await Guardia.findAll();
        res.json(guardias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener guardias' });
    }
};

// Obtener una guardia por ID
exports.getGuardiaById = async (req, res) => {
    try {
        const guardia = await Guardia.findByPk(req.params.id);

        if (!guardia) {
            return res.status(404).json({ error: 'Guardia no encontrada' });
        }

        res.json(guardia);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la guardia' });
    }
};

// Crear una guardia
exports.createGuardia = async (req, res) => {
    try {
        const nuevaGuardia = await Guardia.create(req.body);
        res.status(201).json(nuevaGuardia);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la guardia' });
    }
};

// Actualizar una guardia
exports.updateGuardia = async (req, res) => {
    try {
        const guardia = await Guardia.findByPk(req.params.id);

        if (!guardia) {
            return res.status(404).json({ error: 'Guardia no encontrada' });
        }

        await guardia.update(req.body);

        res.json(guardia);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la guardia' });
    }
};

// Eliminar una guardia
exports.deleteGuardia = async (req, res) => {
    try {
        const guardia = await Guardia.findByPk(req.params.id);

        if (!guardia) {
            return res.status(404).json({ error: 'Guardia no encontrada' });
        }

        await guardia.destroy();

        res.json({ message: 'Guardia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la guardia' });
    }
};