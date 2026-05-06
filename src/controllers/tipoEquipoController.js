const TipoEquipo = require('../../src/models/TipoEquipo');

const tipoEquipoController = {
    getAll: async (req, res) => {
        try {
            const tipos = await TipoEquipo.findAll();
            res.json(tipos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los tipos de equipo' });
        }
    },
    create: async (req, res) => {
        try {
            const { nombre } = req.body;
            const tipo = await TipoEquipo.create({ nombre });
            res.status(201).json({ message: 'Tipo de equipo creado', tipo });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el tipo de equipo', details: error.message });
        }
    },
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre } = req.body;
            const tipo = await TipoEquipo.findByPk(id);
            if (!tipo) return res.status(404).json({ error: 'Tipo de equipo no encontrado' });

            await tipo.update({ nombre });
            res.json(tipo);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el tipo de equipo' });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const tipo = await TipoEquipo.findByPk(id);
            if (!tipo) return res.status(404).json({ error: 'Tipo de equipo no encontrado' });

            await tipo.destroy();
            res.json({ message: 'Tipo de equipo eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el tipo de equipo' });
        }
    }
};

module.exports = tipoEquipoController;