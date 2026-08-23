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
        const { tipo_explosivo, cantidad_por_caja, peso_unitario, costo_por_kg, unidad_medida, codigo } = req.body;
        const nuevoExplosivo = await Explosivo.create({ tipo_explosivo, cantidad_por_caja, peso_unitario, costo_por_kg, unidad_medida, codigo });
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

        const { tipo_explosivo, cantidad_por_caja, peso_unitario, costo_por_kg, unidad_medida, codigo } = req.body;
        await explosivo.update({ tipo_explosivo, cantidad_por_caja, peso_unitario, costo_por_kg, unidad_medida, codigo });
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
