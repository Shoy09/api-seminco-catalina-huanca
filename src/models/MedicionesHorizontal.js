const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const MedicionesHorizontal = sequelize.define('MedicionesHorizontal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  turno: {
    type: DataTypes.STRING,
    allowNull: true
  },
  empresa: {
    type: DataTypes.STRING,
    allowNull: true
  },
  zona: {
    type: DataTypes.STRING,
    allowNull: true
  },
  labor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  veta: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipo_perforacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  kg_explosivos: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  avance_programado: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  ancho: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  alto: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  envio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  id_explosivo: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  idnube: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true // ✅ aseguras que no haya duplicados
  },
  no_aplica: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  remanente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'mediciones_horizontal',
  timestamps: false
});

module.exports = MedicionesHorizontal;
