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

      await queryInterface.addColumn(tabla, 'observaciones_jefe2', {
        type: Sequelize.JSON,
        allowNull: true,
      });

      await queryInterface.addColumn(tabla, 'observaciones_jefe3', {
        type: Sequelize.JSON,
        allowNull: true,
      });

    }

  },

  async down(queryInterface, Sequelize) {

    for (const tabla of tablas) {

      await queryInterface.removeColumn(tabla, 'observaciones_jefe2');
      await queryInterface.removeColumn(tabla, 'observaciones_jefe3');

    }

  }
};