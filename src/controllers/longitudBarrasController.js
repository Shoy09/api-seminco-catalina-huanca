const LongitudBarras = require('../../src/models/LongitudBarras');

const longitudBarrasController = {

    // Obtener todas las longitudes
    getAll: async (req, res) => {
        try {
            const registros = await LongitudBarras.findAll();
            res.json(registros);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener las longitudes de barras' });
        }
    },

    // Crear nueva longitud
    create: async (req, res) => {
        try {
            const { proceso, longitud_pies } = req.body;

            const nuevoRegistro = await LongitudBarras.create({
                proceso,
                longitud_pies
            });

            res.status(201).json({
                message: 'Longitud de barra creada exitosamente',
                data: nuevoRegistro
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al crear la longitud de barra',
                details: error.message
            });
        }
    },

    // Actualizar
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { proceso, longitud_pies } = req.body;

            const registro = await LongitudBarras.findByPk(id);

            if (!registro) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }

            await registro.update({
                proceso,
                longitud_pies
            });

            res.json(registro);

        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar la longitud de barra' });
        }
    },

    // Eliminar
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const registro = await LongitudBarras.findByPk(id);

            if (!registro) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }

            await registro.destroy();

            res.json({ message: 'Registro eliminado correctamente' });

        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar la longitud de barra' });
        }
    }
};

module.exports = longitudBarrasController;