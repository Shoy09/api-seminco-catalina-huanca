const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Pdf = sequelize.define('Pdf', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    url_pdf: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    carpeta_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'carpetas',
            key: 'id'
        }
    }
}, {
    tableName: 'pdfs',
    timestamps: true
});

// Asociaciones
const Carpeta = require('./Carpeta');
Pdf.belongsTo(Carpeta, { foreignKey: 'carpeta_id', as: 'carpeta' });
Carpeta.hasMany(Pdf, { foreignKey: 'carpeta_id', as: 'pdfs' });

module.exports = Pdf;
