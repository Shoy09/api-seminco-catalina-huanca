'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accesorios', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      tipo_accesorio: {
        type: Sequelize.STRING,
        allowNull: false
      },
      costo: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: 'Costo en $/pieza o $/m'
      },
      unidad_medida: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('accesorios');
  }
};