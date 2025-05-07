const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { testConnection, pool } = require('./config/database');
const authRoutes = require('./routes/authRoutes');

// Función para ejecutar migraciones
async function runMigrations() {
  try {
    console.log('Ejecutando migraciones...');
    await pool.query(`
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

    
    console.log('Migraciones completadas');
  } catch (error) {
    console.error('Error en migraciones:', error);
  }
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);

// Ruta principal - esencial para el healthcheck
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'EducStation API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Healthcheck específico
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

// Función principal
async function startServer() {
  // Ejecutar migraciones primero
  await runMigrations();
  
  // Iniciar el servidor
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    
    // Probar conexión a la base de datos
    await testConnection();
  });
}

startServer();

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada no manejada:', error);
});