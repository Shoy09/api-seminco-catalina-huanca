const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PlanProduccion = sequelize.define(
  "PlanProduccion",
  {
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

    // Valores numéricos de producción
    ancho_veta: { type: DataTypes.FLOAT, allowNull: true },
    ancho_minado_sem: { type: DataTypes.FLOAT, allowNull: true },
    ancho_minado_mes: { type: DataTypes.FLOAT, allowNull: true },
    ag_gr: { type: DataTypes.FLOAT, allowNull: true },
    porcentaje_cu: { type: DataTypes.FLOAT, allowNull: true },
    porcentaje_pb: { type: DataTypes.FLOAT, allowNull: true },
    porcentaje_zn: { type: DataTypes.FLOAT, allowNull: true },
    vpt_act: { type: DataTypes.FLOAT, allowNull: true },
    vpt_final: { type: DataTypes.FLOAT, allowNull: true },
    cut_off_1: { type: DataTypes.FLOAT, allowNull: true },
    cut_off_2: { type: DataTypes.FLOAT, allowNull: true },
    programado: {
      type: DataTypes.ENUM('Programado', 'No Programado'),
      allowNull: false,
      defaultValue: 'Programado'
  },

    // Columnas dinámicas 1A-28B
    ...Object.fromEntries(
      Array.from({ length: 28 }, (_, i) => [
        `columna_${i + 1}A`,
        { type: DataTypes.TEXT, allowNull: true },
      ])
    ),
    ...Object.fromEntries(
      Array.from({ length: 28 }, (_, i) => [
        `columna_${i + 1}B`,
        { type: DataTypes.TEXT, allowNull: true },
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
  },
  {
    tableName: "planproduccions", // Especifica el nombre correcto de la tabla
    timestamps: true, // Habilita createdAt y updatedAt
  }
);

module.exports = PlanProduccion;
