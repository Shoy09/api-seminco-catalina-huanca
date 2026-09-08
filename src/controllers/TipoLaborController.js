const TipoLabor = require("../models/TipoLabor");

// Obtener todos los tipos de labor
const getAllTipoLabor = async (req, res) => {
  try {
      const tipos = await TipoLabor.findAll();
      res.status(200).json(tipos);
  } catch (error) {
      console.error("Error en getAllTipoLabor:", error);
      res.status(500).json({ message: 'Error al obtener los tipos de labor', error: error.message });
  }
};

// Obtener un tipo de labor por ID
const getTipoLaborById = async (req, res) => {
    try {
        const { id } = req.params;
        const tipo = await TipoLabor.findByPk(id);
        if (!tipo) {
            return res.status(404).json({ message: "Tipo de labor no encontrado" });
        }
        res.status(200).json(tipo);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el tipo de labor", error });
    }
};

// Crear un nuevo tipo de labor
const createTipoLabor = async (req, res) => {
    try {
        const newTipo = await TipoLabor.create(req.body);
        res.status(201).json(newTipo);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el tipo de labor", error });
    }
};

// Actualizar un tipo de labor por ID
const updateTipoLabor = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await TipoLabor.update(req.body, { where: { id } });

        if (updated) {
            const updatedTipo = await TipoLabor.findByPk(id);
            return res.status(200).json(updatedTipo);
        }

        res.status(404).json({ message: "Tipo de labor no encontrado" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el tipo de labor", error });
    }
};

// Eliminar un tipo de labor por ID
const deleteTipoLabor = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await TipoLabor.destroy({ where: { id } });

        if (deleted) {
            return res.status(200).json({ message: "Tipo de labor eliminado correctamente" });
        }

        res.status(404).json({ message: "Tipo de labor no encontrado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el tipo de labor", error });
    }
};

module.exports = {
    getAllTipoLabor,
    getTipoLaborById,
    createTipoLabor,
    updateTipoLabor,
    deleteTipoLabor
};