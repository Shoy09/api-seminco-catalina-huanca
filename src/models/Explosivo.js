const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Explosivo = sequelize.define('Explosivo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo_explosivo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cantidad_por_caja: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    peso_unitario: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    costo_por_kg: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    unidad_medida: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'explosivos',
    timestamps: false
});

module.exports = Explosivo;
