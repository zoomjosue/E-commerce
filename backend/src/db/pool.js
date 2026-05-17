const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'tienda_deportes',
  user: process.env.DB_USER || 'proy2',
  password: process.env.DB_PASSWORD || 'secret',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(connection => {
    console.log('Conexión a la base de datos establecida');
    connection.release();
  })
  .catch(error => {
    console.error('Error conectando a la base de datos:', error.message);
  });

module.exports = pool;