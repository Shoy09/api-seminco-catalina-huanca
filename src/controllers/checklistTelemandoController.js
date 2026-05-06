const ChecklistTelemando = require('../../src/models/ChecklistTelemando');

const checklistTelemandoController = {
    getAll: async (req, res) => {
        try {
            const checklists = await ChecklistTelemando.findAll(); 
            res.json(checklists);
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al obtener los checklists de telemando',
                details: error.message 
            });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const checklist = await ChecklistTelemando.findByPk(id);
            
            if (!checklist) {
                return res.status(404).json({ 
                    error: 'Checklist de telemando no encontrado' 
                });
            }
            
            res.json(checklist);
        } catch (error) {
            res.status(500).json({ 
                error: 'Error al obtener el checklist de telemando',
                details: error.message 
            });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre } = req.body;

            // Validar que el nombre no esté vacío
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({ 
                    error: 'El nombre es requerido' 
                });
            }

            // Crear el nuevo checklist
            const checklist = await ChecklistTelemando.create({
                nombre: nombre.trim()
            });

            res.status(201).json({
                message: 'Checklist de telemando creado exitosamente',
                checklist
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al crear el checklist de telemando',
                details: error.message
            });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre } = req.body;

            // Validar que el nombre no esté vacío
            if (!nombre || nombre.trim() === '') {
                return res.status(400).json({ 
                    error: 'El nombre es requerido' 
                });
            }

            const checklist = await ChecklistTelemando.findByPk(id);
            
            if (!checklist) {
                return res.status(404).json({ 
                    error: 'Checklist de telemando no encontrado' 
                });
            }

            await checklist.update({ 
                nombre: nombre.trim() 
            });

            res.json({
                message: 'Checklist de telemando actualizado exitosamente',
                checklist
            });

        } catch (error) {
            res.status(500).json({ 
                error: 'Error al actualizar el checklist de telemando',
                details: error.message 
            });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const checklist = await ChecklistTelemando.findByPk(id);
            
            if (!checklist) {
                return res.status(404).json({ 
                    error: 'Checklist de telemando no encontrado' 
                });
            }

            await checklist.destroy();
            
            res.json({ 
                message: 'Checklist de telemando eliminado correctamente' 
            });

        } catch (error) {
            res.status(500).json({ 
                error: 'Error al eliminar el checklist de telemando',
                details: error.message 
            });
        }
    }
};

module.exports = checklistTelemandoController;