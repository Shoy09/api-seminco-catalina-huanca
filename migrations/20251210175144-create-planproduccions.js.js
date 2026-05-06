'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('planproduccions', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      anio: { type: Sequelize.INTEGER, allowNull: true },
      mes: { type: Sequelize.STRING(20), allowNull: false },
      semana: { type: Sequelize.STRING(20), allowNull: false },
      mina: { type: Sequelize.STRING(50), allowNull: false },
      zona: { type: Sequelize.STRING(50), allowNull: false },
      area: { type: Sequelize.STRING(50), allowNull: false },
      fase: { type: Sequelize.STRING(50), allowNull: false },
      minado_tipo: { type: Sequelize.STRING(50), allowNull: false },
      tipo_labor: { type: Sequelize.STRING(50), allowNull: false },
      tipo_mineral: { type: Sequelize.STRING(50), allowNull: false },
      estructura_veta: { type: Sequelize.STRING(50), allowNull: false },
      nivel: { type: Sequelize.STRING(20), allowNull: true },
      block: { type: Sequelize.STRING(20), allowNull: true },
      labor: { type: Sequelize.STRING(20), allowNull: false },
      ala: { type: Sequelize.STRING(20), allowNull: true },

      ancho_veta: { type: Sequelize.FLOAT, allowNull: true },
      ancho_minado_sem: { type: Sequelize.FLOAT, allowNull: true },
      ancho_minado_mes: { type: Sequelize.FLOAT, allowNull: true },
      ag_gr: { type: Sequelize.FLOAT, allowNull: true },
      porcentaje_cu: { type: Sequelize.FLOAT, allowNull: true },
      porcentaje_pb: { type: Sequelize.FLOAT, allowNull: true },
      porcentaje_zn: { type: Sequelize.FLOAT, allowNull: true },
      vpt_act: { type: Sequelize.FLOAT, allowNull: true },
      vpt_final: { type: Sequelize.FLOAT, allowNull: true },
      cut_off_1: { type: Sequelize.FLOAT, allowNull: true },
      cut_off_2: { type: Sequelize.FLOAT, allowNull: true },

      programado: {
        type: Sequelize.ENUM('Programado', 'No Programado'),
        allowNull: false,
        defaultValue: 'Programado'
      },

      // Columnas dinámicas A
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `columna_${i + 1}A`,
          { type: Sequelize.TEXT, allowNull: true }
        ])
      ),

      // Columnas dinámicas B
      ...Object.fromEntries(
        Array.from({ length: 28 }, (_, i) => [
          `columna_${i + 1}B`,
          { type: Sequelize.TEXT, allowNull: true }
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

    });
  },

  async down(queryInterface) {

    // Eliminación segura del ENUM (evita errores en PostgreSQL / MySQL)
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_planproduccions_programado";`
    );

    await queryInterface.dropTable('planproduccions');
  }
};
