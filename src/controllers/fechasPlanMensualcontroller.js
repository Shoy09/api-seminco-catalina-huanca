const FechasPlanMensual = require("../models/fechasPlanMensual.model");

// Obtener todas las fechas
const getFechas = async (req, res) => {
  try {
    const fechas = await FechasPlanMensual.findAll();
    
    if (!fechas || fechas.length === 0) {
      return res.status(404).json({ error: "No se encontraron fechas" });
    }

    res.json(fechas);
  } catch (error) {
    console.error("Error al obtener las fechas:", error); // 🛠️ Muestra el error en la consola
    res.status(500).json({ error: "Error al obtener las fechas", detalle: error.message });
  }
};

// Obtener el último registro agregado con el año en fecha_ingreso
const getUltimaFecha = async (req, res) => {
  try {
    const ultimaFecha = await FechasPlanMensual.findOne({
      order: [["id", "DESC"]], // Ordena por ID descendente
    });

    if (!ultimaFecha) {
      return res.status(404).json({ error: "No se encontró ninguna fecha registrada" });
    }

    res.json({
      id: ultimaFecha.id,
      mes: ultimaFecha.mes,
      fecha_ingreso: new Date(ultimaFecha.fecha_ingreso).getFullYear(), // Obtiene solo el año
    });
  } catch (error) {
    console.error("Error al obtener la última fecha:", error);
    res.status(500).json({ error: "Error al obtener la última fecha", detalle: error.message });
  }
};

// Crear una nueva fecha
const createFecha = async (req, res) => {
  try {
    const { mes } = req.body;

    if (!mes) {
      return res.status(400).json({ error: "El campo 'mes' es obligatorio" });
    }

    const nuevaFecha = await FechasPlanMensual.create({ mes });
    res.status(201).json(nuevaFecha);
  } catch (error) {
    console.error("Error al crear la fecha:", error); // 🛠️ Muestra el error en la consola
    res.status(400).json({ error: "Error al crear la fecha", detalle: error.message });
  }
};



module.exports = { getFechas, getUltimaFecha, createFecha };
