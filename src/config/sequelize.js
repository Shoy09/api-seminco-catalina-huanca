const { Sequelize } = require('sequelize');
require('dotenv').config();

// 🔥 Validación obligatoria de variables
const requiredEnv = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

requiredEnv.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`❌ Variable de entorno faltante: ${env}`);
  }
});

// 🔥 Parseo seguro del puerto
const DB_PORT = Number(process.env.DB_PORT) || 3306;

// 🔥 Debug (solo útil en desarrollo)
console.log('🔍 DB CONFIG:');
console.log('HOST:', process.env.DB_HOST);
console.log('PORT:', DB_PORT);
console.log('DB:', process.env.DB_NAME);
console.log('USER:', process.env.DB_USER);

// 🔥 Conexión Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',

    logging: false, // opcional: quita logs SQL en producción

    dialectOptions: {
      connectTimeout: 60000 // evita timeouts rápidos en cloud
    }
  }
);

// 🔥 Test de conexión
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida con éxito');
  } catch (err) {
    console.error('❌ Error de conexión a la BD:', err.message);
  }
})();

module.exports = sequelize;