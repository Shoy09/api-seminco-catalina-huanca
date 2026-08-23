'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    // 1. Agregar columnas permitiendo null temporalmente
    await queryInterface.addColumn('accesorios', 'codigo', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('explosivos', 'codigo', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. Rellenar códigos para registros existentes
    await queryInterface.sequelize.query(`
      UPDATE accesorios
      SET codigo = CONCAT('ACC-', id)
      WHERE codigo IS NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE explosivos
      SET codigo = CONCAT('EXP-', id)
      WHERE codigo IS NULL;
    `);

    // 3. Convertir a NOT NULL + UNIQUE
    await queryInterface.changeColumn('accesorios', 'codigo', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });

    await queryInterface.changeColumn('explosivos', 'codigo', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('accesorios', 'codigo');
    await queryInterface.removeColumn('explosivos', 'codigo');
  }
};
