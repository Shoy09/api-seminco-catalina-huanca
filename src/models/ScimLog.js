// models/ScimLog.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const ScimLog = sequelize.define(
  'ScimLog',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    method: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    endpoint: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status_code: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    request_body: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    response_body: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'scim_logs',
    timestamps: true,
  }
);

module.exports = ScimLog;
