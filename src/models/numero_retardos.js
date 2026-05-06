const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const NumeroRetardos = sequelize.define('NumeroRetardos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mes: {
        type: DataTypes.STRING,
        allowNull: false
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'numero_retardos',
    timestamps: false
});

module.exports = NumeroRetardos;