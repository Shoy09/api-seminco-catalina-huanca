'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tabla principal de grupos SCIM (sincronizados desde Entra ID)
    await queryInterface.createTable('scim_groups', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      externalId: {
        type: Sequelize.STRING(36),
        allowNull: true,
        unique: true,
        comment: 'Object ID del grupo en Microsoft Entra ID',
      },
      displayName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre del grupo en Entra ID',
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

    // 2. Tabla de membresía grupo ↔ usuario (N:M)
    await queryInterface.createTable('scim_group_members', {
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'scim_groups', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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

    // 3. PK compuesta en la tabla de membresía
    await queryInterface.addConstraint('scim_group_members', {
      fields: ['group_id', 'user_id'],
      type: 'primary key',
      name: 'pk_scim_group_members',
    });

    // 4. Índices para búsquedas eficientes
    await queryInterface.addIndex('scim_groups', ['externalId'], {
      name: 'idx_scim_groups_external_id',
      unique: true,
    });
    await queryInterface.addIndex('scim_groups', ['displayName'], {
      name: 'idx_scim_groups_display_name',
    });
    await queryInterface.addIndex('scim_group_members', ['user_id'], {
      name: 'idx_scim_group_members_user_id',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('scim_group_members', 'idx_scim_group_members_user_id');
    await queryInterface.removeIndex('scim_groups', 'idx_scim_groups_display_name');
    await queryInterface.removeIndex('scim_groups', 'idx_scim_groups_external_id');
    await queryInterface.dropTable('scim_group_members');
    await queryInterface.dropTable('scim_groups');
  },
};
