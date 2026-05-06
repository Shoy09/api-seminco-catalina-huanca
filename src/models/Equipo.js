const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Equipo = sequelize.define('Equipo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    proceso: {
        type: DataTypes.STRING,
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    marca: {
        type: DataTypes.STRING,
        allowNull: false
    },
    modelo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    serie: {
        type: DataTypes.STRING,
        allowNull: false
    },
    anioFabricacion: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fechaIngreso: {
        type: DataTypes.DATE,
        allowNull: false
    },
    capacidadYd3: {
        type: DataTypes.FLOAT,
        allowNull: true 
    },
    capacidadM3: {
        type: DataTypes.FLOAT,
        allowNull: true 
    }
}, {
    tableName: 'equipos',
    timestamps: false
});

module.exports = Equipo;
