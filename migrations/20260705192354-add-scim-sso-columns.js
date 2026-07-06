'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Agregar columna entra_oid (identificador único de Azure AD)
    await queryInterface.addColumn('usuarios', 'entra_oid', {
      type: Sequelize.STRING(36),
      allowNull: true,
      unique: true,
      comment: 'Object ID de Microsoft Entra ID - identificador inmutable del usuario'
    });

    // 2. Agregar columna activo (para soft delete desde SCIM)
    await queryInterface.addColumn('usuarios', 'activo', {
      type: Sequelize.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
      comment: '1 = activo, 0 = desactivado por SCIM desde Azure'
    });

    // 3. Modificar password para que sea NULL (para usuarios SSO)
    await queryInterface.changeColumn('usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Puede ser NULL para usuarios que solo usan SSO'
    });

    // 4. Modificar codigo_dni para que sea NULL (SCIM no lo envía)
    await queryInterface.changeColumn('usuarios', 'codigo_dni', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Puede ser NULL para usuarios creados por SCIM'
    });

    // 5. Crear índices para búsquedas eficientes
    await queryInterface.addIndex('usuarios', ['entra_oid'], {
      name: 'idx_usuarios_entra_oid',
      unique: true
    });

    // Índice compuesto para búsquedas frecuentes de SCIM
    await queryInterface.addIndex('usuarios', ['correo', 'entra_oid'], {
      name: 'idx_usuarios_correo_entra'
    });

    // Índice para filtrar usuarios activos/inactivos
    await queryInterface.addIndex('usuarios', ['activo'], {
      name: 'idx_usuarios_activo'
    });

    // Nota: También podrías agregar el comentario a la tabla si tu BD lo soporta
    // await queryInterface.sequelize.query(`
    //   COMMENT ON TABLE usuarios IS 'Tabla de usuarios con soporte para SCIM y SSO';
    // `);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices (en orden inverso)
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_activo');
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_correo_entra');
    await queryInterface.removeIndex('usuarios', 'idx_usuarios_entra_oid');

    // Revertir cambios en columnas (volver a estado anterior)
    await queryInterface.changeColumn('usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('usuarios', 'codigo_dni', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Eliminar columnas agregadas
    await queryInterface.removeColumn('usuarios', 'activo');
    await queryInterface.removeColumn('usuarios', 'entra_oid');
  }
};