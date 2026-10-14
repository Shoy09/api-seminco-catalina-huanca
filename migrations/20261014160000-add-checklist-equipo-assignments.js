'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Existing items remain applicable to their entire process, including future equipment.
    await queryInterface.addColumn('checklist_items', 'aplica_todos_equipos', {
      type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true,
    });
    await queryInterface.createTable('checklist_item_equipos', {
      checklist_item_id: {
        type: Sequelize.INTEGER, allowNull: false, primaryKey: true,
        references: { model: 'checklist_items', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
      },
      equipo_id: {
        type: Sequelize.INTEGER, allowNull: false, primaryKey: true,
        references: { model: 'equipos', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE',
      },
    });
    await queryInterface.addIndex('checklist_item_equipos', ['equipo_id'], { name: 'checklist_item_equipos_equipo_idx' });
  },

  async down(queryInterface) {
    // Rollback removes equipment restrictions; item definitions and IDs are preserved.
    await queryInterface.dropTable('checklist_item_equipos');
    await queryInterface.removeColumn('checklist_items', 'aplica_todos_equipos');
  },
};
