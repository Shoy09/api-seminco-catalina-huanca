'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Operacion_scalamin', 'guardia', {
      type: Sequelize.STRING,
      allowNull: true // O false si quieres que sea obligatorio
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Operacion_scalamin', 'guardia');
  }
};