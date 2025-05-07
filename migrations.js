const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function runMigrations() {
  let connection;
  
  try {
    console.log('Iniciando migraciones de base de datos...');

    // Determinar el nombre de la base de datos
    const dbName = process.env.MYSQL_URL 
      ? new URL(process.env.MYSQL_URL).pathname.substring(1) 
      : (process.env.DB_NAME || 'educcorp_educs');

    console.log(`Usando base de datos: ${dbName}`);

    // Crear conexión sin especificar base de datos
    if (process.env.MYSQL_URL) {
      // Para Railway, conectamos sin la parte de la base de datos
      const urlObj = new URL(process.env.MYSQL_URL);
      connection = await mysql.createConnection({
        host: urlObj.hostname,
        port: urlObj.port,
        user: urlObj.username,
        password: urlObj.password
      });
    } else {
      // Para local
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || ''
      });
    }

    // Crear la base de datos si no existe - usando query en lugar de execute
    console.log(`Creando base de datos ${dbName} si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Base de datos ${dbName} verificada/creada.`);
    
    // Cerrar la conexión actual
    await connection.end();
    
    // Crear una nueva conexión especificando la base de datos
    if (process.env.MYSQL_URL) {
      // Usamos la URL original completa que ya incluye la base de datos
      connection = await mysql.createConnection(process.env.MYSQL_URL);
    } else {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: dbName
      });
    }
    
    // Crear tabla auth_user
    console.log('Creando tabla auth_user...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS auth_user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        is_staff BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        date_joined DATETIME NOT NULL,
        is_superuser BOOLEAN DEFAULT FALSE
      )
    `);
        // Crear tabla Administrador
    console.log('Creando tabla Administrador...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Administrador (
        ID_administrador INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        Nombre VARCHAR(50) NOT NULL,
        Correo_electronico VARCHAR(100) UNIQUE NOT NULL,
        Contraseña VARCHAR(255) NOT NULL
      )
    `);
    
        // Crear tabla Categorias
        console.log('Creando tabla Categorias...');
        await connection.query(`
          CREATE TABLE IF NOT EXISTS Categorias (
            ID_categoria INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            Nombre_categoria VARCHAR(50) UNIQUE NOT NULL,
            Descripcion VARCHAR(255) NOT NULL
          )
        `);
    
    console.log('Migraciones completadas con éxito!');
  } catch (error) {
    console.error('Error al ejecutar migraciones:', error);
  } finally {
    // Cerrar conexión
    if (connection) await connection.end();
    process.exit(0);
  }
}

runMigrations();