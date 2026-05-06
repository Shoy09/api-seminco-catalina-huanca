'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Operacion_carguio', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      fecha: Sequelize.STRING,
      turno: Sequelize.STRING,
      seccion: Sequelize.STRING,
      operador: Sequelize.STRING,
      jefe_guardia: Sequelize.STRING,
      equipo: Sequelize.STRING,
      n_equipo: Sequelize.STRING,
      capacidad: Sequelize.STRING,
      tipo_equipo: Sequelize.STRING,
      registros: Sequelize.TEXT,
      horometros: Sequelize.TEXT,
      condiciones_equipo: Sequelize.TEXT,
      programa_trabajo: Sequelize.TEXT,
      check_list: Sequelize.TEXT,
      check_list_telemando: Sequelize.TEXT,
      control_llantas: Sequelize.TEXT,
      estado: { type: Sequelize.STRING, defaultValue: 'activo' },
      envio: { type: Sequelize.INTEGER, defaultValue: 0 }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Operacion_carguio');
  }
};