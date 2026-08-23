'use strict';

/** 
 * Migración: Refactorizar tabla numero_retardos
 * - Elimina columnas: mes, anio, cantidad
 * - Agrega columnas: longitud, tipo, codigo, enumeracion
 * Aplica solo si la tabla ya existe con la estructura anterior.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar columnas antiguas
    await queryInterface.removeColumn('numero_retardos', 'mes');
    await queryInterface.removeColumn('numero_retardos', 'anio');
    await queryInterface.removeColumn('numero_retardos', 'cantidad');

    // Agregar nuevas columnas
    await queryInterface.addColumn('numero_retardos', 'longitud', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('numero_retardos', 'tipo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.addColumn('numero_retardos', 'codigo', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
      unique: true
    });

    await queryInterface.addColumn('numero_retardos', 'enumeracion', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    // Revertir: eliminar columnas nuevas
    await queryInterface.removeColumn('numero_retardos', 'longitud');
    await queryInterface.removeColumn('numero_retardos', 'tipo');
    await queryInterface.removeColumn('numero_retardos', 'codigo');
    await queryInterface.removeColumn('numero_retardos', 'enumeracion');

    // Restaurar columnas antiguas
    await queryInterface.addColumn('numero_retardos', 'mes', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.addColumn('numero_retardos', 'anio', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('numero_retardos', 'cantidad', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  }
};
