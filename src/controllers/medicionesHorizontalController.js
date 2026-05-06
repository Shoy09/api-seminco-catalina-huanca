const MedicionesHorizontal = require('../models/MedicionesHorizontal');

// Obtener todas las mediciones horizontales
const getAllMedicionesHorizontal = async (req, res) => {
  try {
    const mediciones = await MedicionesHorizontal.findAll();
    res.status(200).json(mediciones);
  } catch (error) {
    console.error("Error en getAllMedicionesHorizontal:", error);
    res.status(500).json({ message: 'Error al obtener las mediciones horizontales', error: error.message });
  }
};

const getMedicionesConRemanente = async (req, res) => {
  try {
    const mediciones = await MedicionesHorizontal.findAll({
      where: { remanente: 1 }
    });
    res.status(200).json(mediciones);
  } catch (error) {
    console.error("Error en getMedicionesConRemanente:", error);
    res.status(500).json({
      message: 'Error al obtener las mediciones con remanente',
      error: error.message
    });
  }
};


// Obtener una medición horizontal por ID
const getMedicionHorizontalById = async (req, res) => {
  try {
    const { id } = req.params;
    const medicion = await MedicionesHorizontal.findByPk(id);
    if (!medicion) {
      return res.status(404).json({ message: 'Medición horizontal no encontrada' });
    }
    res.status(200).json(medicion);
  } catch (error) {
    console.error("Error en getMedicionHorizontalById:", error);
    res.status(500).json({ message: 'Error al obtener la medición horizontal', error: error.message });
  }
};

// Crear una medición horizontal
const createMedicionHorizontal = async (req, res) => {
  try {
    const data = req.body;

    // ✅ Si es un array de mediciones
    if (Array.isArray(data)) {
      // Validar duplicados antes de insertar
      for (const medicion of data) {
        if (medicion.idnube) {
          const existente = await MedicionesHorizontal.findOne({
            where: { idnube: medicion.idnube }
          });
          if (existente) {
            return res.status(409).json({
              message: `Ya existe una medición horizontal con idnube ${medicion.idnube}`
            });
          }
        }
      }

      // ✅ Eliminar "id" pero mantener "idnube"
      const cleanData = data.map(m => {
        const { id, ...rest } = m;
        return rest;
      });

      const nuevasMediciones = await MedicionesHorizontal.bulkCreate(cleanData);
      return res.status(201).json(nuevasMediciones);
    }

    // ✅ Si es un solo objeto
    const { id, ...restData } = data; // quitamos id si viene
    if (restData.idnube) {
      const existente = await MedicionesHorizontal.findOne({
        where: { idnube: restData.idnube }
      });
      if (existente) {
        return res.status(409).json({
          message: `Ya existe una medición horizontal con idnube ${restData.idnube}`
        });
      }
    }

    const nuevaMedicion = await MedicionesHorizontal.create(restData);
    res.status(201).json(nuevaMedicion);

  } catch (error) {
    console.error("Error en createMedicionHorizontal:", error);
    res.status(500).json({
      message: 'Error al crear la medición horizontal',
      error: error.message
    });
  }
};


 
// Actualizar una medición horizontal
const updateMedicionHorizontal = async (req, res) => {
  try {
    const { id } = req.params;
    const medicion = await MedicionesHorizontal.findByPk(id);
    if (!medicion) {
      return res.status(404).json({ message: 'Medición horizontal no encontrada' });
    }

    await medicion.update(req.body);
    res.status(200).json(medicion);
  } catch (error) {
    console.error("Error en updateMedicionHorizontal:", error);
    res.status(500).json({ message: 'Error al actualizar la medición horizontal', error: error.message });
  }
};

// Eliminar una medición horizontal
const deleteMedicionHorizontal = async (req, res) => {
  try {
    const { id } = req.params;
    const medicion = await MedicionesHorizontal.findByPk(id);
    if (!medicion) {
      return res.status(404).json({ message: 'Medición horizontal no encontrada' });
    }

    await medicion.destroy();
    res.status(200).json({ message: 'Medición horizontal eliminada correctamente' });
  } catch (error) {
    console.error("Error en deleteMedicionHorizontal:", error);
    res.status(500).json({ message: 'Error al eliminar la medición horizontal', error: error.message });
  }
};

module.exports = {
  getAllMedicionesHorizontal,
  getMedicionHorizontalById,
  createMedicionHorizontal,
  updateMedicionHorizontal,
  deleteMedicionHorizontal,
  getMedicionesConRemanente
};
