'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('fechas_plan_mensual', {

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

      fecha_ingreso: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('fechas_plan_mensual');
  }
};
