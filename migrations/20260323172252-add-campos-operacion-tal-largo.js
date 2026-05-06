'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Operacion_tal_largo', 'revisado', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });

    await queryInterface.addColumn('Operacion_tal_largo', 'aprobacion', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('Operacion_tal_largo', 'observaciones_jefe', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Operacion_tal_largo', 'revisado');
    await queryInterface.removeColumn('Operacion_tal_largo', 'aprobacion');
    await queryInterface.removeColumn('Operacion_tal_largo', 'observaciones_jefe');
  }
};