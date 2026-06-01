const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Material = sequelize.define('Material', {
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
    tableName: 'materiales',
    timestamps: false
});

module.exports = Material;