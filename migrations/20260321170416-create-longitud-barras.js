'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('longitud_barras', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      proceso: {
        type: Sequelize.STRING,
        allowNull: false
      },
      longitud_pies: {
        type: Sequelize.FLOAT,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('longitud_barras');
  }
};