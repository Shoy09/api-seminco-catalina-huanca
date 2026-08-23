const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const NumeroRetardos = sequelize.define('NumeroRetardos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    longitud: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    enumeracion: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'numero_retardos',
    timestamps: false
});

module.exports = NumeroRetardos;
