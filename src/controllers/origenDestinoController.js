const OrigenDestino = require('../../src/models/OrigenDestino');

const origenDestinoController = {

    // 🔹 Obtener todos
    getAll: async (req, res) => {
        try {
            const registros = await OrigenDestino.findAll();
            res.json(registros);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los registros de origen_destino' });
        }
    },

    // 🔹 Crear
    create: async (req, res) => {
        try {
            const { proceso, tipo, nombre } = req.body;

            const registro = await OrigenDestino.create({
                proceso,
                tipo,
                nombre
            });

            res.status(201).json({
                message: 'Registro creado exitosamente',
                data: registro
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al crear el registro',
                details: error.message
            });
        }
    },

    // 🔹 Actualizar
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { proceso, tipo, nombre } = req.body;

            const registro = await OrigenDestino.findByPk(id);

            if (!registro) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }

            await registro.update({
                proceso,
                tipo,
                nombre
            });

            res.json(registro);

        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el registro' });
        }
    },

    // 🔹 Eliminar
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const registro = await OrigenDestino.findByPk(id);

            if (!registro) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }

            await registro.destroy();

            res.json({ message: 'Registro eliminado correctamente' });

        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el registro' });
        }
    }
};

module.exports = origenDestinoController;