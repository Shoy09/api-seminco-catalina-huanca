const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ToneladasScoop = sequelize.define('ToneladasScoop', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    turno: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mineral: {
        type: DataTypes.STRING,
        allowNull: false
    },
    factor: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false
    }
}, {
    tableName: 'toneladas_scoops',
    timestamps: false
});

module.exports = ToneladasScoop;