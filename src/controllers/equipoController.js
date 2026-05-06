const Equipo = require('../../src/models/Equipo');

const equipoController = {
    getAll: async (req, res) => {
        try {
            const equipos = await Equipo.findAll(); 
            res.json(equipos);
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener los equipos' });
        }
    },
    create: async (req, res) => {
        try {
            const { nombre, proceso, codigo, marca, modelo, serie, anioFabricacion, fechaIngreso, capacidadYd3, capacidadM3 } = req.body;
    
            // Crear el nuevo equipo
            const equipo = await Equipo.create({
                nombre,
                proceso,
                codigo,
                marca,
                modelo,
                serie,
                anioFabricacion,
                fechaIngreso,
                capacidadYd3,
                capacidadM3
            });
    
            res.status(201).json({
                message: 'Equipo creado exitosamente',
                equipo
            });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Error al crear el equipo',
                details: error.message
            });
        }
    },
    
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, proceso, codigo, marca, modelo, serie, anioFabricacion, fechaIngreso, capacidadYd3, capacidadM3 } = req.body;
            const equipo = await Equipo.findByPk(id);
            if (!equipo) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }
            await equipo.update({ nombre, proceso, codigo, marca, modelo, serie, anioFabricacion, fechaIngreso, capacidadYd3, capacidadM3 });
            res.json(equipo);
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar el equipo' });
        }
    },
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const equipo = await Equipo.findByPk(id);
            if (!equipo) {
                return res.status(404).json({ error: 'Equipo no encontrado' });
            }
            await equipo.destroy();
            res.json({ message: 'Equipo eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ error: 'Error al eliminar el equipo' });
        }
    },
    getByProceso: async (req, res) => {
    try {
        const { proceso } = req.params;

        const equipos = await Equipo.findAll({
            where: { proceso }
        });

        res.json(equipos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener equipos por proceso' });
    }
}
};

module.exports = equipoController;
