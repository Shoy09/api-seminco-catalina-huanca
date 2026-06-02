'use strict';

const tablas = [
  'Operacion_tal_largo',
  'Operacion_tal_horizontal',
  'Operacion_scissor',
  'Operacion_scalamin',
  'Operacion_rompebanco',
  'Operacion_empernador',
  'Operacion_dumper',
  'Operacion_carguio',
  'Operacion_anfochanger'
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