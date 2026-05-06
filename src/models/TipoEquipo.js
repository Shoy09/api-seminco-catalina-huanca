const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const TipoEquipo = sequelize.define('TipoEquipo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'tipo_equipos', // nombre de la tabla en la BD
    timestamps: false
});

module.exports = TipoEquipo;