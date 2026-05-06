const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Seccion = sequelize.define('Seccion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    proceso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'secciones', // nombre de la tabla en la BD
    timestamps: false
});

module.exports = Seccion;