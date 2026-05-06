'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tipoperforacions', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      nombre: {
        type: Sequelize.STRING,
        allowNull: false
      },

      proceso: {
        type: Sequelize.STRING,
        allowNull: true
      },

      permitido_medicion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tipoperforacions');
  }
};
