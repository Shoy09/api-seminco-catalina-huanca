// models/ScimGroup.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ScimGroup = sequelize.define(
  'ScimGroup',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    externalId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      unique: true,
      comment: 'Object ID del grupo en Microsoft Entra ID',
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nombre del grupo en Entra ID',
    },
  },
  {
    tableName: 'scim_groups',
    timestamps: true,
  }
);

// ── Asociaciones N:M con usuarios ─────────────────────────────────────────────
// Se llaman después de que ambos modelos estén cargados (ver scimGroupController)
ScimGroup.associate = (models) => {
  ScimGroup.belongsToMany(models.Usuario, {
    through: 'scim_group_members',
    foreignKey: 'group_id',
    otherKey: 'user_id',
    as: 'members',
    timestamps: true,
  });
};

module.exports = ScimGroup;
