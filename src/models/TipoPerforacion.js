const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TipoPerforacion = sequelize.define('TipoPerforacion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    proceso: {
        type: DataTypes.STRING,
        allowNull: true // Permitir valores nulos
    },
    permitido_medicion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
    tableName: 'tipoperforacions',
    timestamps: false
});

module.exports = TipoPerforacion;
 