'use strict';

const tablas = [
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

      await queryInterface.addColumn(tabla, 'revisado', {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      });

      await queryInterface.addColumn(tabla, 'aprobacion', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      });

      await queryInterface.addColumn(tabla, 'observaciones_jefe', {
        type: Sequelize.JSON,
        allowNull: true,
      });

    }

  },

  async down(queryInterface, Sequelize) {

    for (const tabla of tablas) {

      await queryInterface.removeColumn(tabla, 'revisado');
      await queryInterface.removeColumn(tabla, 'aprobacion');
      await queryInterface.removeColumn(tabla, 'observaciones_jefe');

    }

  }
};