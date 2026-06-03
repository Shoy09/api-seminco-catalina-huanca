const ToneladasScoop = require('../models/toneladas_scoops');

// Obtener todos los registros
exports.getAllToneladasScoops = async (req, res) => {
    try {
        const registros = await ToneladasScoop.findAll();
        res.json(registros);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los registros' });
    }
};

// Obtener un registro por ID
exports.getToneladasScoopById = async (req, res) => {
    try {
        const registro = await ToneladasScoop.findByPk(req.params.id);

        if (!registro) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        res.json(registro);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el registro' });
    }
};

// Crear un registro
exports.createToneladasScoop = async (req, res) => {
    try {
        const nuevoRegistro = await ToneladasScoop.create(req.body);
        res.status(201).json(nuevoRegistro);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el registro' });
    }
};

// Actualizar un registro
exports.updateToneladasScoop = async (req, res) => {
    try {
        const registro = await ToneladasScoop.findByPk(req.params.id);

        if (!registro) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        await registro.update(req.body);

        res.json(registro);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el registro' });
    }
};

// Eliminar un registro
exports.deleteToneladasScoop = async (req, res) => {
    try {
        const registro = await ToneladasScoop.findByPk(req.params.id);

        if (!registro) {
            return res.status(404).json({ error: 'Registro no encontrado' });
        }

        await registro.destroy();

        res.json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el registro' });
    }
};