'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('scim_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      method: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'GET, POST, PUT, PATCH, DELETE',
      },
      endpoint: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Ej: /api/scim/v2/Users, /api/scim/v2/Groups/3',
      },
      status_code: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'HTTP status code de la respuesta',
      },
      request_body: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Body de la petición entrante (JSON)',
      },
      response_body: {
        type: Sequelize.TEXT('long'),
        allowNull: true,
        comment: 'Body de la respuesta enviada (JSON)',
      },
      ip: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'IP de origen (Entra ID)',
      },
      error: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensaje de error si hubo excepción',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('scim_logs', ['method'], { name: 'idx_scim_logs_method' });
    await queryInterface.addIndex('scim_logs', ['status_code'], { name: 'idx_scim_logs_status' });
    await queryInterface.addIndex('scim_logs', ['createdAt'], { name: 'idx_scim_logs_created' });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('scim_logs', 'idx_scim_logs_created');
    await queryInterface.removeIndex('scim_logs', 'idx_scim_logs_status');
    await queryInterface.removeIndex('scim_logs', 'idx_scim_logs_method');
    await queryInterface.dropTable('scim_logs');
  },
};
