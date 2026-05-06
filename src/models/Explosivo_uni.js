const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Explisivos_uni = sequelize.define('Explisivos_uni', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dato: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    tipo: {  // Nuevo campo
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'explisivos_uni',
    timestamps: false
});

module.exports = Explisivos_uni;
