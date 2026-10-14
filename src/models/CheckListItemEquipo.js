const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

module.exports = sequelize.define('CheckListItemEquipo', {
  checklist_item_id: {
    type: DataTypes.INTEGER, allowNull: false, primaryKey: true,
    references: { model: 'checklist_items', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
  },
  equipo_id: {
    type: DataTypes.INTEGER, allowNull: false, primaryKey: true,
    references: { model: 'equipos', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
  },
}, {
  tableName: 'checklist_item_equipos', timestamps: false,
  indexes: [{ name: 'checklist_item_equipos_equipo_idx', fields: ['equipo_id'] }],
});
