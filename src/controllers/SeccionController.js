const Seccion = require('../../src/models/seccion');

const seccionController = {

    getAll: async (req, res) => {
        try {
            const secciones = await Seccion.findAll();
            res.json(secciones);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las secciones' });
        }
    },

    create: async (req, res) => {
        try {
            const { proceso, nombre } = req.body;

            const seccion = await Seccion.create({
                proceso,
                nombre
            });

            res.status(201).json({
                message: 'Sección creada exitosamente',
                seccion
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al crear la sección',
                details: error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { proceso, nombre } = req.body;

            const seccion = await Seccion.findByPk(id);

            if (!seccion) {
                return res.status(404).json({ error: 'Sección no encontrada' });
            }

            await seccion.update({
                proceso,
                nombre
            });

            res.json(seccion);

        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar la sección' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const seccion = await Seccion.findByPk(id);

            if (!seccion) {
                return res.status(404).json({ error: 'Sección no encontrada' });
            }

            await seccion.destroy();

            res.json({
                message: 'Sección eliminada correctamente'
            });

        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar la sección' });
        }
    },

    getByProceso: async (req, res) => {
    try {
        const { proceso } = req.params;

        const secciones = await Seccion.findAll({
            where: { proceso }
        });

        res.json(secciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener secciones por proceso' });
    }
}

};

module.exports = seccionController;