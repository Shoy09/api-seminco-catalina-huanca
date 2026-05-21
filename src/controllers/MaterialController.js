const Material = require('../models/Material');

// Obtener todos los materiales
exports.getAllMateriales = async (req, res) => {
    try {
        const materiales = await Material.findAll();
        res.json(materiales);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener materiales' });
    }
};

// Obtener un material por ID
exports.getMaterialById = async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (!material) return res.status(404).json({ error: 'Material no encontrado' });
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el material' });
    }
};

// Crear un material
exports.createMaterial = async (req, res) => {
    try {
        const nuevoMaterial = await Material.create(req.body);
        res.status(201).json(nuevoMaterial);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el material' });
    }
};

// Actualizar un material
exports.updateMaterial = async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (!material) return res.status(404).json({ error: 'Material no encontrado' });

        await material.update(req.body);
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el material' });
    }
};

// Eliminar un material
exports.deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (!material) return res.status(404).json({ error: 'Material no encontrado' });

        await material.destroy();
        res.json({ message: 'Material eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el material' });
    }
};