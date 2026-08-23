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
      longitud: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      codigo: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      enumeracion: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('numero_retardos');
  }
};
