const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ChecklistTelemando = sequelize.define('ChecklistTelemando', {
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
    tableName: 'checklists_telemando',
    timestamps: false
});

module.exports = ChecklistTelemando;