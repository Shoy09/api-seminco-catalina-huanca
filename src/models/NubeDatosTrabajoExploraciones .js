const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

// Modelo principal nube_DatosTrabajoExploraciones
const NubeDatosTrabajoExploraciones = sequelize.define('nube_DatosTrabajoExploraciones', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: { type: DataTypes.STRING, allowNull: false },
    turno: { type: DataTypes.STRING, allowNull: false },
    taladro: { type: DataTypes.STRING, allowNull: false },
    pies_por_taladro: { type: DataTypes.STRING, allowNull: false },
    zona: { type: DataTypes.STRING, allowNull: false },
    tipo_labor: { type: DataTypes.STRING, allowNull: false },
    labor: { type: DataTypes.STRING, allowNull: false },
    ala: { type: DataTypes.STRING }, // Nuevo campo
    veta: { type: DataTypes.STRING, allowNull: false },
    nivel: { type: DataTypes.STRING, allowNull: false },
    tipo_perforacion: { type: DataTypes.STRING, allowNull: false },
    estado: { type: DataTypes.STRING, defaultValue: 'Creado' },
    cerrado: { type: DataTypes.INTEGER, defaultValue: 0 },
    envio: { type: DataTypes.INTEGER, defaultValue: 0 }, // Nuevo campo
    semanaDefault: { type: DataTypes.STRING }, // Nuevo campo
    semanaSelect: { type: DataTypes.STRING }, // Nuevo campo
    empresa: { type: DataTypes.STRING }, // Nuevo campo
    seccion: { type: DataTypes.STRING },
    medicion: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
    tableName: 'nube_datos_trabajo_exploraciones',
    timestamps: true,
});
 
// Modelo nube_Despacho
const NubeDespacho = sequelize.define('nube_Despacho', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mili_segundo: { type: DataTypes.FLOAT, allowNull: false },
    medio_segundo: { type: DataTypes.FLOAT, allowNull: false },
    observaciones: { type: DataTypes.TEXT } // Nuevo campo
}, {
    tableName: 'nube_despacho',
    timestamps: true,
});

// Modelo nube_DespachoDetalle
const NubeDespachoDetalle = sequelize.define('nube_DespachoDetalle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_material: { type: DataTypes.STRING, allowNull: false },
    cantidad: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'nube_despacho_detalle',
    timestamps: true,
});

// Modelo nube_Devoluciones
const NubeDevoluciones = sequelize.define('nube_Devoluciones', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mili_segundo: { type: DataTypes.FLOAT, allowNull: false },
    medio_segundo: { type: DataTypes.FLOAT, allowNull: false },
    observaciones: { type: DataTypes.TEXT } // Nuevo campo
}, {
    tableName: 'nube_devoluciones',
    timestamps: true,
});

// Modelo nube_DevolucionDetalle
const NubeDevolucionDetalle = sequelize.define('nube_DevolucionDetalle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre_material: { type: DataTypes.STRING, allowNull: false },
    cantidad: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'nube_devolucion_detalle',
    timestamps: true,
});

// Modelo nube_DetalleDespachoExplosivos
const NubeDetalleDespachoExplosivos = sequelize.define('nube_DetalleDespachoExplosivos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: { type: DataTypes.INTEGER, allowNull: false },
    ms_cant1: { type: DataTypes.STRING, allowNull: false },
    lp_cant1: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'nube_detalle_despacho_explosivos',
    timestamps: true,
});

// Modelo nube_DetalleDevolucionesExplosivos
const NubeDetalleDevolucionesExplosivos = sequelize.define('nube_DetalleDevolucionesExplosivos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: { type: DataTypes.INTEGER, allowNull: false },
    ms_cant1: { type: DataTypes.STRING, allowNull: false },
    lp_cant1: { type: DataTypes.STRING, allowNull: false }
}, {
    tableName: 'nube_detalle_devoluciones_explosivos',
    timestamps: true,
});

// Establecer relaciones (sin cambios)
NubeDatosTrabajoExploraciones.hasMany(NubeDespacho, { 
    foreignKey: 'datos_trabajo_id', 
    as: 'despachos',
    onDelete: 'CASCADE'
});
NubeDespacho.belongsTo(NubeDatosTrabajoExploraciones, { 
    foreignKey: 'datos_trabajo_id', 
    as: 'datos_trabajo' 
});

NubeDespacho.hasMany(NubeDespachoDetalle, { 
    foreignKey: 'despacho_id', 
    as: 'detalles',
    onDelete: 'CASCADE'
});
NubeDespachoDetalle.belongsTo(NubeDespacho, { 
    foreignKey: 'despacho_id', 
    as: 'despacho' 
});

NubeDespacho.hasMany(NubeDetalleDespachoExplosivos, { 
    foreignKey: 'id_despacho', 
    as: 'detalles_explosivos',
    onDelete: 'CASCADE'
});
NubeDetalleDespachoExplosivos.belongsTo(NubeDespacho, { 
    foreignKey: 'id_despacho', 
    as: 'despacho' 
});

NubeDatosTrabajoExploraciones.hasMany(NubeDevoluciones, { 
    foreignKey: 'datos_trabajo_id', 
    as: 'devoluciones',
    onDelete: 'CASCADE'
});
NubeDevoluciones.belongsTo(NubeDatosTrabajoExploraciones, { 
    foreignKey: 'datos_trabajo_id', 
    as: 'datos_trabajo' 
});

NubeDevoluciones.hasMany(NubeDevolucionDetalle, { 
    foreignKey: 'devolucion_id', 
    as: 'detalles',
    onDelete: 'CASCADE'
});
NubeDevolucionDetalle.belongsTo(NubeDevoluciones, { 
    foreignKey: 'devolucion_id', 
    as: 'devolucion' 
});

NubeDevoluciones.hasMany(NubeDetalleDevolucionesExplosivos, { 
    foreignKey: 'id_devolucion', 
    as: 'detalles_explosivos',
    onDelete: 'CASCADE'
});
NubeDetalleDevolucionesExplosivos.belongsTo(NubeDevoluciones, { 
    foreignKey: 'id_devolucion', 
    as: 'devolucion' 
});

module.exports = {
    NubeDatosTrabajoExploraciones,
    NubeDespacho,
    NubeDespachoDetalle,
    NubeDevoluciones,
    NubeDevolucionDetalle,
    NubeDetalleDespachoExplosivos,
    NubeDetalleDevolucionesExplosivos
};