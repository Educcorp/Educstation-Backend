/*
  Migración para añadir el campo avatar a la tabla auth_user
*/
const mysql = require('mysql2/promise');
require('dotenv').config();

const createConnectionConfig = () => {
  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  };
};

async function addAvatarField() {
  let connection;
  
  try {
    console.log('Conectando a la base de datos...');
    const config = createConnectionConfig();
    connection = await mysql.createConnection(config);
    
    // Primero comprobamos si la columna ya existe
    console.log('Verificando si el campo avatar ya existe en la tabla auth_user...');
    const [columns] = await connection.query('SHOW COLUMNS FROM auth_user LIKE "avatar"');
    
    if (columns.length === 0) {
      // La columna no existe, la añadimos
      console.log('El campo avatar no existe. Añadiéndolo a la tabla...');
      await connection.query(`
        ALTER TABLE auth_user
        ADD COLUMN avatar LONGTEXT DEFAULT NULL
      `);
      console.log('Campo avatar añadido correctamente a la tabla auth_user.');
    } else {
      console.log('El campo avatar ya existe en la tabla auth_user. No se requieren cambios.');
    }
    
    console.log('Migración completada con éxito.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    if (connection) {
      console.log('Cerrando conexión a la base de datos...');
      await connection.end();
    }
    process.exit(0);
  }
}

// Ejecutar la migración
addAvatarField(); 