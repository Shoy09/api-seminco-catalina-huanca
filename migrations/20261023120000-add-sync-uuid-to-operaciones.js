'use strict';

// Nombres exactos de los modelos y migraciones existentes (MySQL/Linux).
const tables = [
  'Operacion_tal_largo', 'Operacion_tal_horizontal', 'Operacion_empernador',
  'Operacion_carguio', 'Operacion_rompebanco', 'Operacion_scissor',
  'Operacion_anfochanger', 'Operacion_scalamin', 'Operacion_dumper',
  'Operacion_Volquetes',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    // MySQL confirma DDL implicitamente. Se puede reanudar si falla a mitad.
    for (const table of tables) {
      const columns = await queryInterface.describeTable(table);
      if (!columns.sync_uuid) {
        await queryInterface.addColumn(table, 'sync_uuid', {
          type: Sequelize.STRING(36), allowNull: true, defaultValue: null,
        });
      }
      const indexes = await queryInterface.showIndex(table);
      const hasUniqueKey = indexes.some(index => index.unique &&
        index.fields.length === 1 && index.fields[0].attribute === 'sync_uuid');
      if (!hasUniqueKey) {
        await queryInterface.addIndex(table, ['sync_uuid'], {
          name: 'uq_' + table + '_sync_uuid', unique: true,
        });
      }
    }
    // No inventar claves para filas antiguas: no coincidirian con las tablets.
  },
  async down(queryInterface) {
    for (const table of [...tables].reverse()) {
      const columns = await queryInterface.describeTable(table);
      if (columns.sync_uuid) await queryInterface.removeColumn(table, 'sync_uuid');
    }
  },
};
