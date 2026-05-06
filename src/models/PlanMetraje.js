const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PlanMetraje = sequelize.define("PlanMetraje", {
  anio: { type: DataTypes.INTEGER, allowNull: true },
  mes: { type: DataTypes.STRING(20), allowNull: false },
  semana: { type: DataTypes.STRING(20), allowNull: false },
  mina: { type: DataTypes.STRING(50), allowNull: false },
  zona: { type: DataTypes.STRING(50), allowNull: false },
  area: { type: DataTypes.STRING(50), allowNull: false },
  fase: { type: DataTypes.STRING(50), allowNull: false },
  minado_tipo: { type: DataTypes.STRING(50), allowNull: false },
  tipo_labor: { type: DataTypes.STRING(50), allowNull: false },
  tipo_mineral: { type: DataTypes.STRING(50), allowNull: false },
  estructura_veta: { type: DataTypes.STRING(50), allowNull: false },
  nivel: { type: DataTypes.STRING(20), allowNull: true },
  block: { type: DataTypes.STRING(20), allowNull: true },
  labor: { type: DataTypes.STRING(20), allowNull: false },
  ala: { type: DataTypes.STRING(20), allowNull: true },
  
  // Usamos FLOAT para valores numéricos
  ancho_veta: { type: DataTypes.FLOAT, allowNull: true },
  ancho_minado_sem: { type: DataTypes.FLOAT, allowNull: true },
  ancho_minado_mes: { type: DataTypes.FLOAT, allowNull: true },
  burden: { type: DataTypes.FLOAT, allowNull: true },
  espaciamiento: { type: DataTypes.FLOAT, allowNull: true },
  longitud_perforacion: { type: DataTypes.FLOAT, allowNull: true },
  programado: {
    type: DataTypes.ENUM('Programado', 'No Programado'),
    allowNull: false,
    defaultValue: 'Programado'
},

  // Optimizamos las columnas dinámicas
  ...Object.fromEntries(
    Array.from({ length: 28 }, (_, i) => [
      `columna_${i + 1}A`,
      { type: DataTypes.TEXT, allowNull: true }, // Usamos TEXT en lugar de STRING
    ])
  ),
  ...Object.fromEntries(
    Array.from({ length: 28 }, (_, i) => [
      `columna_${i + 1}B`,
      { type: DataTypes.TEXT, allowNull: true }, // Usamos TEXT en lugar de STRING
    ])
  ),

  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'planmetraje',  // Aquí es donde defines el nombre exacto de la tabla
  timestamps: true,           // Mantiene el manejo de timestamps
});

module.exports = PlanMetraje;
