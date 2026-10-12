'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('equipos', 'nombre_excel', {
      type: Sequelize.STRING,
      allowNull: true // cámbialo a false si quieres que sea obligatorio
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('equipos', 'nombre_excel');
  }
};