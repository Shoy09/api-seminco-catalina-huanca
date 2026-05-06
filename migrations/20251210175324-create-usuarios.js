'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuarios', {
      
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      codigo_dni: {
        type: Sequelize.STRING,
        allowNull: false
      },

      apellidos: {
        type: Sequelize.STRING,
        allowNull: false
      },

      nombres: {
        type: Sequelize.STRING,
        allowNull: false
      },

      cargo: {
        type: Sequelize.STRING,
        allowNull: true
      },

      rol: {
        type: Sequelize.STRING,
        allowNull: true
      },

      empresa: {
        type: Sequelize.STRING,
        allowNull: true
      },

      guardia: {
        type: Sequelize.STRING,
        allowNull: true
      },

      autorizado_equipo: {
        type: Sequelize.STRING,
        allowNull: true
      },

      area: {
        type: Sequelize.STRING,
        allowNull: true
      },

      clasificacion: {
        type: Sequelize.STRING,
        allowNull: true
      },

      correo: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },

      password: {
        type: Sequelize.STRING,
        allowNull: false
      },

      firma: {
        type: Sequelize.STRING,
        allowNull: true
      },

      operaciones_autorizadas: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('usuarios');
  }
};
