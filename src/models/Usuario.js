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
    codigo_dni: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellidos: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nombres: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cargo: {
      type: DataTypes.STRING,
      allowNull: true, // Ahora puede ser NULL
    },
    rol: {
      type: DataTypes.STRING,
      allowNull: true, // o false si quieres que sea obligatorio
    },
    empresa: {
      type: DataTypes.STRING,
      allowNull: true, // Ahora puede ser NULL
    },
    guardia: {
      type: DataTypes.STRING,
      allowNull: true, // Ahora puede ser NULL
    },
    autorizado_equipo: {
      type: DataTypes.STRING,
      allowNull: true, // Ahora puede ser NULL
    },
    area: {
      type: DataTypes.STRING,
      allowNull: true, // Ahora puede ser NULL
    },
    clasificacion: {
      type: DataTypes.STRING,
      allowNull: true, // Ahora puede ser NULL
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: true, // Puede ser NULL si se crea desde el Excel sin correo
      unique: true,
      validate: {
        isEmail: {
          msg: "Debe ingresar un correo electrónico válido.",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^(?=.*[a-zA-Z0-9@#$%^&+=]).{6,}$/,
          msg: "La contraseña debe tener al menos 6 caracteres, incluyendo letras, números y símbolos.",
        },
      },
    },
    firma: {
      type: DataTypes.STRING,
      allowNull: true, // Puede ser NULL si el usuario no tiene una imagen de firma
    },
    operaciones_autorizadas: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}, // Ninguna operación autorizada por defecto
    },
  },
  {
    tableName: "usuarios",
    timestamps: true,
  }
);

module.exports = Usuario;
