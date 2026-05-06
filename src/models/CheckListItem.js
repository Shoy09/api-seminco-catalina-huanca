const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const CheckListItem = sequelize.define('CheckListItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  proceso: {
    type: DataTypes.STRING,
    allowNull: false
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'checklist_items',
  timestamps: false
});

module.exports = CheckListItem;
