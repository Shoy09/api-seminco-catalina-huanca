const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Mallas = sequelize.define('Mallas', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_malla: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'mallas',
    timestamps: false
});

module.exports = Mallas;