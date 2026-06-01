'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('materiales', 'proceso', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '' // temporal para registros existentes
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('materiales', 'proceso');
  }
};