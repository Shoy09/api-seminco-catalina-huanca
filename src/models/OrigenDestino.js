const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const OrigenDestino = sequelize.define('OrigenDestino', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    proceso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'origen_destino',
    timestamps: false
});

module.exports = OrigenDestino;