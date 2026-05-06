'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('numero_retardos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      mes: {
        type: Sequelize.STRING,
        allowNull: false
      },
      anio: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('numero_retardos');
  }
};