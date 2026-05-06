'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Operacion_scissor', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: Sequelize.STRING,
      turno: Sequelize.STRING,
      operador: Sequelize.STRING,
      jefe_guardia: Sequelize.STRING,
      equipo: Sequelize.STRING,
      n_equipo: Sequelize.STRING,
      registros: Sequelize.TEXT,
      horometros: Sequelize.TEXT,
      condiciones_equipo: Sequelize.TEXT,
      check_list: Sequelize.TEXT,
      control_llantas: Sequelize.TEXT,
      estado: { type: Sequelize.STRING, defaultValue: 'activo' },
      envio: { type: Sequelize.INTEGER, defaultValue: 0 }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Operacion_scissor');
  }
};