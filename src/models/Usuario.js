// models/Usuario.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Usuario = sequelize.define(
  "Usuario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // ── Campos de identidad SSO (nuevos) ─────────────────────────────────
    entra_oid: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
      comment: "Object ID inmutable de Microsoft Entra ID",
    },
    activo: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1,
      comment: "0 = desactivado por SCIM desde Azure",
    },

    // ── Campos que SCIM puede poblar ─────────────────────────────────────
    correo: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: { msg: "Debe ingresar un correo electrónico válido." },
      },
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // ── Campos del negocio (se completan manualmente en tu app) ───────────
    codigo_dni: {
      type: DataTypes.STRING,
      allowNull: true,   // ← cambiado a true: SCIM no lo conoce
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    empresa: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    guardia: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    autorizado_equipo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    clasificacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firma: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    operaciones_autorizadas: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
    },

    // ── Password: se mantiene pero ya no se usa para login ───────────────
    // Cuando SSO esté estable en prod, hacer allowNull: true
    password: {
      type: DataTypes.STRING,
      allowNull: true,  // ← cambiado a true porque SCIM no envía passwords
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
  }
);

module.exports = Usuario;