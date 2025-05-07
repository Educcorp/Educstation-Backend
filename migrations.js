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
    
    // Crear tabla Usuarios
    console.log('Creando tabla Usuarios...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Usuarios (
        ID_usuarios INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        Nombre_Completo VARCHAR(100) NOT NULL,
        Nickname VARCHAR(30) UNIQUE NOT NULL,
        Correo_electronico VARCHAR(254) UNIQUE NOT NULL,
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
    
    // Crear tabla Historial_Publicaciones
    console.log('Creando tabla Historial_Publicaciones...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Historial_Publicaciones (
        ID_Historial INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        ID_publicacion INT NOT NULL,
        Nombre_blog VARCHAR(100) NOT NULL,
        Contenido_anterior TEXT NOT NULL,
        Fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ID_publicacion) REFERENCES Publicaciones(ID_publicaciones) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla Comentarios
    console.log('Creando tabla Comentarios...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Comentarios (
        ID_comentario INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        ID_publicacion INT NOT NULL,
        ID_Usuario INT NOT NULL,
        Nickname VARCHAR(40) NOT NULL,
        Contenido TEXT NOT NULL,
        Fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ID_publicacion) REFERENCES Publicaciones(ID_publicaciones) ON DELETE CASCADE,
        FOREIGN KEY (ID_Usuario) REFERENCES Usuarios(ID_usuarios) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla Imagenes
    console.log('Creando tabla Imagenes...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Imagenes (
        ID_imagen INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        Nombre_archivo VARCHAR(255) NOT NULL,
        Ruta VARCHAR(255) NOT NULL,
        Tipo VARCHAR(50) NOT NULL,
        Tamaño INT NOT NULL,
        Alt_text VARCHAR(255),
        Fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Crear tabla Publicaciones_Categorias
    console.log('Creando tabla Publicaciones_Categorias...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Publicaciones_Categorias (
        ID_publicacion INT NOT NULL,
        ID_categoria INT NOT NULL,
        PRIMARY KEY (ID_publicacion, ID_categoria),
        FOREIGN KEY (ID_publicacion) REFERENCES Publicaciones(ID_publicaciones) ON DELETE CASCADE,
        FOREIGN KEY (ID_categoria) REFERENCES Categorias(ID_categoria) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla Publicaciones_Imagenes
    console.log('Creando tabla Publicaciones_Imagenes...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Publicaciones_Imagenes (
        ID_publicacion INT NOT NULL,
        ID_imagen INT NOT NULL,
        Es_destacada BOOLEAN DEFAULT FALSE,
        Orden INT DEFAULT 0,
        PRIMARY KEY (ID_publicacion, ID_imagen),
        FOREIGN KEY (ID_publicacion) REFERENCES Publicaciones(ID_publicaciones) ON DELETE CASCADE,
        FOREIGN KEY (ID_imagen) REFERENCES Imagenes(ID_imagen) ON DELETE CASCADE
      )
    `);
    
    // Crear tabla Galerias
    console.log('Creando tabla Galerias...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Galerias (
        ID_galeria INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
        Nombre VARCHAR(100) NOT NULL,
        Descripcion TEXT,
        Fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        ID_administrador INT NOT NULL,
        FOREIGN KEY (ID_administrador) REFERENCES Administrador(ID_administrador) ON DELETE CASCADE
      )
    `);
    
    // Insertar categorías iniciales
    console.log('Insertando categorías iniciales...');
    await connection.query(`
      INSERT IGNORE INTO Categorias (Nombre_categoria, Descripcion) VALUES 
      ('Noticias', 'Últimas noticias y novedades sobre educación y tecnología'),
      ('Técnicas de Estudio', 'Estrategias y métodos para mejorar el aprendizaje'),
      ('Problemáticas en el Estudio', 'Dificultades y retos comunes en el aprendizaje'),
      ('Educación de Calidad', 'Mejores prácticas y estándares para una educación efectiva'),
      ('Herramientas Tecnológicas', 'Tecnología y recursos para mejorar la enseñanza'),
      ('Desarrollo Profesional Docente', 'Capacitación y crecimiento profesional para docentes'),
      ('Comunidad y Colaboración', 'Interacción y trabajo en equipo en el ámbito educativo')
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