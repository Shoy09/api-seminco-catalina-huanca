const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const OperacionVolquetes = sequelize.define('OperacionVolquetes', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha: DataTypes.STRING,
    turno: DataTypes.STRING,
    guardia: DataTypes.STRING,
    operador: DataTypes.STRING,
    jefe_guardia: DataTypes.STRING,
    empresa: DataTypes.STRING,
    n_volquete: DataTypes.STRING,
    registros: DataTypes.TEXT,
    horometros: DataTypes.TEXT,
    estado: { type: DataTypes.STRING, defaultValue: 'activo' },
    envio: { type: DataTypes.INTEGER, defaultValue: 0 },
    Hora_envio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
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
    tableName: 'Operacion_Volquetes',
    timestamps: false
});

module.exports = OperacionVolquetes;