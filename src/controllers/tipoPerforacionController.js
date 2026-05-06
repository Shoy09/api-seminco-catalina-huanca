const TipoPerforacion = require("../models/TipoPerforacion");

// Obtener todos los tipos de perforación
const getAllTipoPerforacion = async (req, res) => {
  try {
      const tipos = await TipoPerforacion.findAll();
      res.status(200).json(tipos);
  } catch (error) {
      console.error("Error en getAllTipoPerforacion:", error); // ⬅ Agregado para depuración
      res.status(500).json({ message: 'Error al obtener los tipos de perforación', error: error.message });
  }
};


// Obtener un tipo de perforación por ID
const getTipoPerforacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const tipo = await TipoPerforacion.findByPk(id);
        if (!tipo) {
            return res.status(404).json({ message: "Tipo de perforación no encontrado" });
        }
        res.status(200).json(tipo);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el tipo de perforación", error });
    }
};

// Crear un nuevo tipo de perforación
const createTipoPerforacion = async (req, res) => {
    try {
        const newTipo = await TipoPerforacion.create(req.body);
        res.status(201).json(newTipo);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el tipo de perforación", error });
    }
};

// Actualizar un tipo de perforación por ID
const updateTipoPerforacion = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await TipoPerforacion.update(req.body, { where: { id } });

        if (updated) {
            const updatedTipo = await TipoPerforacion.findByPk(id);
            return res.status(200).json(updatedTipo);
        }

        res.status(404).json({ message: "Tipo de perforación no encontrado" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el tipo de perforación", error });
    }
};

// Eliminar un tipo de perforación por ID
const deleteTipoPerforacion = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await TipoPerforacion.destroy({ where: { id } });

        if (deleted) {
            return res.status(200).json({ message: "Tipo de perforación eliminado correctamente" });
        }

        res.status(404).json({ message: "Tipo de perforación no encontrado" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el tipo de perforación", error });
    }
};

module.exports = {
    getAllTipoPerforacion,
    getTipoPerforacionById,
    createTipoPerforacion,
    updateTipoPerforacion,
    deleteTipoPerforacion
};
