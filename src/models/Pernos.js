const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Pernos = sequelize.define('Pernos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_perno: {
        type: DataTypes.STRING,
        allowNull: false
    },
    longitud: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    tableName: 'pernos',
    timestamps: false
});

module.exports = Pernos;