'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    // 🔵 1. TABLA PRINCIPAL
    await queryInterface.createTable('nube_datos_trabajo_exploraciones', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },

      fecha: { type: Sequelize.STRING, allowNull: false },
      turno: { type: Sequelize.STRING, allowNull: false },
      taladro: { type: Sequelize.STRING, allowNull: false },
      pies_por_taladro: { type: Sequelize.STRING, allowNull: false },
      zona: { type: Sequelize.STRING, allowNull: false },
      tipo_labor: { type: Sequelize.STRING, allowNull: false },
      labor: { type: Sequelize.STRING, allowNull: false },
      ala: { type: Sequelize.STRING },
      veta: { type: Sequelize.STRING, allowNull: false },
      nivel: { type: Sequelize.STRING, allowNull: false },
      tipo_perforacion: { type: Sequelize.STRING, allowNull: false },

      estado: { type: Sequelize.STRING, defaultValue: 'Creado' },
      cerrado: { type: Sequelize.INTEGER, defaultValue: 0 },
      envio: { type: Sequelize.INTEGER, defaultValue: 0 },

      semanaDefault: { type: Sequelize.STRING },
      semanaSelect: { type: Sequelize.STRING },
      empresa: { type: Sequelize.STRING },
      seccion: { type: Sequelize.STRING },

      medicion: { type: Sequelize.INTEGER, defaultValue: 0 },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 🔵 2. DESPACHO
    await queryInterface.createTable('nube_despacho', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },

      datos_trabajo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nube_datos_trabajo_exploraciones',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      mili_segundo: { type: Sequelize.FLOAT, allowNull: false },
      medio_segundo: { type: Sequelize.FLOAT, allowNull: false },
      observaciones: { type: Sequelize.TEXT },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 🔵 3. DESPACHO DETALLE
    await queryInterface.createTable('nube_despacho_detalle', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },

      despacho_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nube_despacho',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      nombre_material: { type: Sequelize.STRING, allowNull: false },
      cantidad: { type: Sequelize.STRING, allowNull: false },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 🔵 4. DETALLE DESPACHO EXPLOSIVOS
    await queryInterface.createTable('nube_detalle_despacho_explosivos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },

      id_despacho: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nube_despacho',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      numero: { type: Sequelize.INTEGER, allowNull: false },
      ms_cant1: { type: Sequelize.STRING, allowNull: false },
      lp_cant1: { type: Sequelize.STRING, allowNull: false },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 🔵 5. DEVOLUCIONES
    await queryInterface.createTable('nube_devoluciones', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },

      datos_trabajo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nube_datos_trabajo_exploraciones',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      mili_segundo: { type: Sequelize.FLOAT, allowNull: false },
      medio_segundo: { type: Sequelize.FLOAT, allowNull: false },
      observaciones: { type: Sequelize.TEXT },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 🔵 6. DEVOLUCION DETALLE
    await queryInterface.createTable('nube_devolucion_detalle', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },

      devolucion_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nube_devoluciones',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      nombre_material: { type: Sequelize.STRING, allowNull: false },
      cantidad: { type: Sequelize.STRING, allowNull: false },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

    // 🔵 7. DETALLE DEVOLUCIONES EXPLOSIVOS
    await queryInterface.createTable('nube_detalle_devoluciones_explosivos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },

      id_devolucion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'nube_devoluciones',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      numero: { type: Sequelize.INTEGER, allowNull: false },
      ms_cant1: { type: Sequelize.STRING, allowNull: false },
      lp_cant1: { type: Sequelize.STRING, allowNull: false },

      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });

  },

  async down(queryInterface, Sequelize) {
    // 🔥 IMPORTANTE: borrar en orden inverso (por FK)

    await queryInterface.dropTable('nube_detalle_devoluciones_explosivos');
    await queryInterface.dropTable('nube_devolucion_detalle');
    await queryInterface.dropTable('nube_devoluciones');

    await queryInterface.dropTable('nube_detalle_despacho_explosivos');
    await queryInterface.dropTable('nube_despacho_detalle');
    await queryInterface.dropTable('nube_despacho');

    await queryInterface.dropTable('nube_datos_trabajo_exploraciones');
  }
};