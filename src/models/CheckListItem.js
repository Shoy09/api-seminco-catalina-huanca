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
  aplica_todos_equipos: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
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

const Equipo = require('./Equipo');
const CheckListItemEquipo = require('./CheckListItemEquipo');

CheckListItem.belongsToMany(Equipo, {
  through: CheckListItemEquipo, as: 'equipos',
  foreignKey: 'checklist_item_id', otherKey: 'equipo_id'
});
Equipo.belongsToMany(CheckListItem, {
  through: CheckListItemEquipo, as: 'checklistItems',
  foreignKey: 'equipo_id', otherKey: 'checklist_item_id'
});

module.exports = CheckListItem;
