'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('guardias', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      guardia: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('guardias');
  }
};