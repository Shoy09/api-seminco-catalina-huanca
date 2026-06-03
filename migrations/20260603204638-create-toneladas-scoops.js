'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('toneladas_scoops', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      fecha: {
        type: Sequelize.STRING,
        allowNull: false
      },
      turno: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mineral: {
        type: Sequelize.STRING,
        allowNull: false
      },
      factor: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('toneladas_scoops');
  }
};