const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Carpeta = sequelize.define('Carpeta', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    }
}, {
    tableName: 'carpetas',
    timestamps: true
});

module.exports = Carpeta;
