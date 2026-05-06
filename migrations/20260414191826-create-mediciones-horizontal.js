'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mediciones_horizontal', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      fecha: {
        type: Sequelize.STRING,
        allowNull: false
      },

      turno: {
        type: Sequelize.STRING,
        allowNull: true
      },

      empresa: {
        type: Sequelize.STRING,
        allowNull: true
      },

      zona: {
        type: Sequelize.STRING,
        allowNull: true
      },

      labor: {
        type: Sequelize.STRING,
        allowNull: true
      },

      veta: {
        type: Sequelize.STRING,
        allowNull: true
      },

      tipo_perforacion: {
        type: Sequelize.STRING,
        allowNull: true
      },

      kg_explosivos: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      avance_programado: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      ancho: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      alto: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      envio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      id_explosivo: {
        type: Sequelize.INTEGER,
        allowNull: true
      },

      idnube: {
        type: Sequelize.INTEGER,
        allowNull: true,
        unique: true
      },

      no_aplica: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      remanente: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('mediciones_horizontal');
  }
};