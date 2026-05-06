const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const OperacionTalHorizontal = sequelize.define('OperacionTalHorizontal', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: DataTypes.STRING,
    turno: DataTypes.STRING,
    seccion: DataTypes.STRING,
    operador: DataTypes.STRING,
    jefe_guardia: DataTypes.STRING,
    equipo: DataTypes.STRING,
    n_equipo: DataTypes.STRING,
    modelo_equipo: DataTypes.STRING,
    registros: DataTypes.TEXT,
    horometros: DataTypes.TEXT,
    condiciones_equipo: DataTypes.TEXT,
    check_list: DataTypes.TEXT,
    control_llantas: DataTypes.TEXT,
    estado: { type: DataTypes.STRING, defaultValue: 'activo' },
    envio: { type: DataTypes.INTEGER, defaultValue: 0 },
    revisado: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0 
    },
 
    aprobacion: { 
  type: DataTypes.INTEGER, 
  defaultValue: 0 
},
   observaciones_jefe: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    observaciones_jefe2: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    observaciones_jefe3: {
      type: DataTypes.JSON,
      allowNull: true,
    },
}, {
    tableName: 'Operacion_tal_horizontal',
    timestamps: false
});

module.exports = OperacionTalHorizontal;