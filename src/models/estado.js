module.exports = (sequelize, DataTypes) => {
  const Estado = sequelize.define("Estado", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    estado_principal: {
      type: DataTypes.STRING,
      allowNull: false
    },
    codigo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tipo_estado: {
      type: DataTypes.STRING,
      allowNull: false
    },
    categoria: {
      type: DataTypes.STRING,
      allowNull: false
    },
    proceso: {
      type: DataTypes.STRING(255), // Establece el tamaño máximo del campo (puedes cambiar 255 al tamaño que desees)
      allowNull: true // Este campo puede ser nulo si no lo deseas obligatorio
    }
  }, {
    tableName: "estados",
    timestamps: false
  });

  return Estado;
};
