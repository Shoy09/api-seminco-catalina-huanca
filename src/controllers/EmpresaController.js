const Empresa = require('../../src/models/Empresa');

const empresaController = {
    getAll: async (req, res) => {
        try {
            const empresas = await Empresa.findAll();

            res.json(empresas);
        } catch (error) {
            res.status(500).json({
                error: 'Error al obtener las empresas'
            });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre } = req.body;

            const empresa = await Empresa.create({
                nombre
            });

            res.status(201).json({
                message: 'Empresa creada exitosamente',
                empresa
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                error: 'Error al crear la empresa',
                details: error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            const empresa = await Empresa.findByPk(id);

            if (!empresa) {
                return res.status(404).json({
                    error: 'Empresa no encontrada'
                });
            }

            await empresa.update({
                nombre
            });

            res.json(empresa);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                error: 'Error al actualizar la empresa'
            });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const empresa = await Empresa.findByPk(id);

            if (!empresa) {
                return res.status(404).json({
                    error: 'Empresa no encontrada'
                });
            }

            await empresa.destroy();

            res.json({
                message: 'Empresa eliminada correctamente'
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                error: 'Error al eliminar la empresa'
            });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const empresa = await Empresa.findByPk(id);

            if (!empresa) {
                return res.status(404).json({
                    error: 'Empresa no encontrada'
                });
            }

            res.json(empresa);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                error: 'Error al obtener la empresa'
            });
        }
    }
};

module.exports = empresaController;