'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('plan_mensual', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      anio: { type: Sequelize.INTEGER, allowNull: true },
      mes: { type: Sequelize.STRING, allowNull: true },
      minado_tipo: { type: Sequelize.STRING, allowNull: true },
      empresa: { type: Sequelize.STRING, allowNull: true },
      zona: { type: Sequelize.STRING, allowNull: true },
      area: { type: Sequelize.STRING, allowNull: true },
      tipo_mineral: { type: Sequelize.STRING, allowNull: true },
      fase: { type: Sequelize.STRING, allowNull: true },
      estructura_veta: { type: Sequelize.STRING, allowNull: true },
      nivel: { type: Sequelize.STRING, allowNull: true },
      tipo_labor: { type: Sequelize.STRING, allowNull: true },
      labor: { type: Sequelize.STRING, allowNull: true },
      ala: { type: Sequelize.STRING, allowNull: true },
      avance_m: { type: Sequelize.FLOAT, allowNull: true },
      ancho_m: { type: Sequelize.FLOAT, allowNull: true },
      alto_m: { type: Sequelize.FLOAT, allowNull: true },
      tms: { type: Sequelize.FLOAT, allowNull: true },

      programado: {
        type: Sequelize.ENUM('Programado', 'No Programado'),
        allowNull: false,
        defaultValue: 'Programado'
      },

      // --- Campos 1A - 28A ---
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}A`,
          { type: Sequelize.STRING, allowNull: true }
        ])
      ),

      // --- Campos 1B - 28B ---
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `col_${i + 1}B`,
          { type: Sequelize.STRING, allowNull: true }
        ])
      ),

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }

    })
  },

  async down(queryInterface) {

    // Primero eliminar ENUM para evitar errores en PostgreSQL/MySQL
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_plan_mensual_programado";');

    await queryInterface.dropTable('plan_mensual');
  }
};
