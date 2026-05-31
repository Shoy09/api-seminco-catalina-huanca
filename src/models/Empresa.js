const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Empresa = sequelize.define('Empresa', {
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
    tableName: 'empresas',
    timestamps: false
});

module.exports = Empresa;