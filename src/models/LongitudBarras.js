const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const LongitudBarras = sequelize.define('LongitudBarras', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    proceso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    longitud_pies: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    tableName: 'longitud_barras',
    timestamps: false
});

module.exports = LongitudBarras;