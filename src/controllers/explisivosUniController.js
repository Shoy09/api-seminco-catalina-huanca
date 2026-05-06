const Explisivos_uni = require('../models/Explosivo_uni'); // Asegúrate de que la ruta al modelo sea correcta

// Crear un nuevo registro
exports.create = async (req, res) => {
    try {
        const nuevoExplisivo = await Explisivos_uni.create(req.body);
        res.status(201).json(nuevoExplisivo);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los registros
exports.findAll = async (req, res) => {
    try {
        const explisivos = await Explisivos_uni.findAll();
        res.status(200).json(explisivos);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener un registro por ID
exports.findOne = async (req, res) => {
    try {
        const explisivo = await Explisivos_uni.findByPk(req.params.id);
        if (explisivo) {
            res.status(200).json(explisivo);
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un registro por ID
exports.update = async (req, res) => {
    try {
        const [updated] = await Explisivos_uni.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedExplisivo = await Explisivos_uni.findByPk(req.params.id);
            res.status(200).json(updatedExplisivo);
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un registro por ID
exports.delete = async (req, res) => {
    try {
        const deleted = await Explisivos_uni.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).json({ message: 'Registro eliminado' });
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};