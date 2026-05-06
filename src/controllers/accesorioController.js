const Accesorio = require('../models/Accesorio');

// Obtener todos los accesorios
exports.getAllAccesorios = async (req, res) => {
    try {
        const accesorios = await Accesorio.findAll();
        res.json(accesorios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener accesorios' });
    }
};

// Obtener un accesorio por ID
exports.getAccesorioById = async (req, res) => {
    try {
        const accesorio = await Accesorio.findByPk(req.params.id);
        if (!accesorio) return res.status(404).json({ error: 'Accesorio no encontrado' });
        res.json(accesorio);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el accesorio' });
    }
};

// Crear un accesorio
exports.createAccesorio = async (req, res) => {
    try {
        const nuevoAccesorio = await Accesorio.create(req.body);
        res.status(201).json(nuevoAccesorio);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el accesorio' });
    }
};

// Actualizar un accesorio
exports.updateAccesorio = async (req, res) => {
    try {
        const accesorio = await Accesorio.findByPk(req.params.id);
        if (!accesorio) return res.status(404).json({ error: 'Accesorio no encontrado' });

        await accesorio.update(req.body);
        res.json(accesorio);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el accesorio' });
    }
};

// Eliminar un accesorio
exports.deleteAccesorio = async (req, res) => {
    try {
        const accesorio = await Accesorio.findByPk(req.params.id);
        if (!accesorio) return res.status(404).json({ error: 'Accesorio no encontrado' });

        await accesorio.destroy();
        res.json({ message: 'Accesorio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el accesorio' });
    }
};
