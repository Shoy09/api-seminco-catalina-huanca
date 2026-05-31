'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Operacion_Volquetes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha: Sequelize.STRING,
      turno: Sequelize.STRING,
      guardia: Sequelize.STRING,
      operador: Sequelize.STRING,
      jefe_guardia: Sequelize.STRING,
      empresa: Sequelize.STRING,
      n_volquete: Sequelize.STRING,
      registros: Sequelize.TEXT,
      horometros: Sequelize.TEXT,

      estado: {
        type: Sequelize.STRING,
        defaultValue: 'activo'
      },

      envio: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      revisado: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      aprobacion: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },

      observaciones_jefe: {
        type: Sequelize.JSON,
        allowNull: true
      },

      observaciones_jefe2: {
        type: Sequelize.JSON,
        allowNull: true
      },

      observaciones_jefe3: {
        type: Sequelize.JSON,
        allowNull: true
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Operacion_Volquetes');
  }
};