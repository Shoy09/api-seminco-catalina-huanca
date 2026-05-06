'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('estados', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      estado_principal: {
        type: Sequelize.STRING,
        allowNull: false
      },

      codigo: {
        type: Sequelize.STRING,
        allowNull: false, 
      },

      tipo_estado: {
        type: Sequelize.STRING,
        allowNull: false
      },

      categoria: {
        type: Sequelize.STRING,
        allowNull: false
      },

      proceso: {
        type: Sequelize.STRING(255),
        allowNull: true
      }

    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('estados');
  }
};
