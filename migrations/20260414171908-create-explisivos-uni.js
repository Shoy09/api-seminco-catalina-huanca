'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('explisivos_uni', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      dato: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('explisivos_uni');
  }
};