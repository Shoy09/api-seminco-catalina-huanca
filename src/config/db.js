const mysql = require('mysql2');
require('dotenv').config();  


const pool = mysql.createPool({
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT || 3306, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
});


pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error de conexión:', err);
    } else {
        console.log('Conexión a la base de datos establecida');
        connection.release();  
    }
});


module.exports = pool.promise();
