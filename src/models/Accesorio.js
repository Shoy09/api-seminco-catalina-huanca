const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Accesorio = sequelize.define('Accesorio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_accesorio: {
        type: DataTypes.STRING,
        allowNull: false
    },
    costo: {
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: 'Costo en $/pieza o $/m'
    },
    unidad_medida: {
        type: DataTypes.STRING,
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    tableName: 'accesorios',
    timestamps: false
});

module.exports = Accesorio;
