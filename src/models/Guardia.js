const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Guardia = sequelize.define('Guardia', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    guardia: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'guardias',
    timestamps: false
});

module.exports = Guardia;