const Mallas = require('../../src/models/Mallas');

const mallasController = {

    // Obtener todas
    getAll: async (req, res) => {
        try {
            const mallas = await Mallas.findAll();
            res.json(mallas);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las mallas' });
        }
    },

    // Crear
    create: async (req, res) => {
        try {
            const { tipo_malla } = req.body;

            const nuevaMalla = await Mallas.create({
                tipo_malla
            });

            res.status(201).json({
                message: 'Malla creada exitosamente',
                malla: nuevaMalla
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al crear la malla',
                details: error.message
            });
        }
    },

    // Actualizar
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { tipo_malla } = req.body;

            const malla = await Mallas.findByPk(id);

            if (!malla) {
                return res.status(404).json({ error: 'Malla no encontrada' });
            }

            await malla.update({
                tipo_malla
            });

            res.json(malla);

        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar la malla' });
        }
    },

    // Eliminar
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const malla = await Mallas.findByPk(id);

            if (!malla) {
                return res.status(404).json({ error: 'Malla no encontrada' });
            }

            await malla.destroy();

            res.json({ message: 'Malla eliminada correctamente' });

        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar la malla' });
        }
    }
};

module.exports = mallasController;