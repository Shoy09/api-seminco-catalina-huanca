const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TipoLabor = sequelize.define('TipoLabor', {
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
    }
}, {
    tableName: 'tipolabors',
    timestamps: false
});

module.exports = TipoLabor;