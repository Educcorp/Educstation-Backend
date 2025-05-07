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
    

    
        // Crear tabla Categorias
        console.log('Creando tabla Categorias...');
        await connection.query(`
          CREATE TABLE IF NOT EXISTS Categorias (
            ID_categoria INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            Nombre_categoria VARCHAR(50) UNIQUE NOT NULL,
            Descripcion VARCHAR(255) NOT NULL
          )
        `);
        
    // Crear tabla Publicaciones
    console.log('Creando tabla Publicaciones...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Publicaciones (
        ID_publicaciones INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        Titulo VARCHAR(100) NOT NULL,
        Contenido TEXT NOT NULL,
        Resumen VARCHAR(500),
        Estado ENUM('borrador', 'publicado', 'archivado') DEFAULT 'borrador',
        Imagen_destacada_ID INT NULL,
        Fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        Fecha_modificacion DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
        ID_administrador INT NOT NULL,
        FOREIGN KEY (ID_administrador) REFERENCES Administrador(ID_administrador) ON DELETE CASCADE
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