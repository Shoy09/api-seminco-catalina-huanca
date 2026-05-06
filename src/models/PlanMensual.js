const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PlanMensual = sequelize.define('PlanMensual', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    anio: { type: DataTypes.INTEGER, allowNull: true }, 
    mes: { type: DataTypes.STRING, allowNull: true },
    minado_tipo: { type: DataTypes.STRING, allowNull: true },
    empresa: { type: DataTypes.STRING, allowNull: true },
    zona: { type: DataTypes.STRING, allowNull: true },
    area: { type: DataTypes.STRING, allowNull: true },
    tipo_mineral: { type: DataTypes.STRING, allowNull: true },
    fase: { type: DataTypes.STRING, allowNull: true },
    estructura_veta: { type: DataTypes.STRING, allowNull: true },
    nivel: { type: DataTypes.STRING, allowNull: true },
    tipo_labor: { type: DataTypes.STRING, allowNull: true },
    labor: { type: DataTypes.STRING, allowNull: true },
    ala: { type: DataTypes.STRING, allowNull: true },
    avance_m: { type: DataTypes.FLOAT, allowNull: true },
    ancho_m: { type: DataTypes.FLOAT, allowNull: true },
    alto_m: { type: DataTypes.FLOAT, allowNull: true },
    tms: { type: DataTypes.FLOAT, allowNull: true },
    programado: {
        type: DataTypes.ENUM('Programado', 'No Programado'),
        allowNull: false,
        defaultValue: 'Programado'
    },
    // Campos 1A - 28B
    ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
            `col_${i + 1}A`, { type: DataTypes.STRING, allowNull: true }
        ])
    ),
    ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
            `col_${i + 1}B`, { type: DataTypes.STRING, allowNull: true }
        ])
    )
}, {
    tableName: 'plan_mensual',
    timestamps: true,
});

module.exports = PlanMensual;
