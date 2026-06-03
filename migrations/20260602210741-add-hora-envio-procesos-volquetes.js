'use strict';

const tablas = [
  'Operacion_Volquetes',
];

module.exports = {
  async up(queryInterface, Sequelize) {

    for (const tabla of tablas) {

      await queryInterface.addColumn(tabla, 'Hora_envio', {
        type: Sequelize.TEXT,
        allowNull: true,
      });

    }

  },

  async down(queryInterface, Sequelize) {

    for (const tabla of tablas) {

      await queryInterface.removeColumn(tabla, 'Hora_envio');

    }

  }
};