const Pernos = require('../../src/models/Pernos');

const pernosController = {

    // Obtener todos
    getAll: async (req, res) => {
        try {
            const pernos = await Pernos.findAll();
            res.json(pernos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los pernos' });
        }
    },

    // Crear
    create: async (req, res) => {
        try {
            const { tipo_perno, longitud } = req.body;

            const nuevoPerno = await Pernos.create({
                tipo_perno,
                longitud
            });

            res.status(201).json({
                message: 'Perno creado exitosamente',
                perno: nuevoPerno
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al crear el perno',
                details: error.message
            });
        }
    },

    // Actualizar
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { tipo_perno, longitud } = req.body;

            const perno = await Pernos.findByPk(id);

            if (!perno) {
                return res.status(404).json({ error: 'Perno no encontrado' });
            }

            await perno.update({
                tipo_perno,
                longitud
            });

            res.json(perno);

        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el perno' });
        }
    },

    // Eliminar
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const perno = await Pernos.findByPk(id);

            if (!perno) {
                return res.status(404).json({ error: 'Perno no encontrado' });
            }

            await perno.destroy();

            res.json({ message: 'Perno eliminado correctamente' });

        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el perno' });
        }
    }
};

module.exports = pernosController;