const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { testConnection, pool } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const publicacionesRoutes = require('./routes/publicacionesRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');



// Función para ejecutar migraciones
async function runMigrations() {
  try {
    console.log('Ejecutando migraciones...');
    await pool.query(`
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
        // Crear tabla auth_user
        console.log('Creando tabla auth_user...');
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
        await pool.query(`
          CREATE TABLE IF NOT EXISTS Administrador (
            ID_administrador INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            Nombre VARCHAR(50) NOT NULL,
            Correo_electronico VARCHAR(100) UNIQUE NOT NULL,
            Contraseña VARCHAR(255) NOT NULL
          )
        `);
        
        // Crear tabla Usuarios
        console.log('Creando tabla Usuarios...');
        await pool.query(`
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
        await pool.query(`
          CREATE TABLE IF NOT EXISTS Categorias (
            ID_categoria INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
            Nombre_categoria VARCHAR(50) UNIQUE NOT NULL,
            Descripcion VARCHAR(255) NOT NULL
          )
        `);
        
        // Crear tabla Publicaciones
        console.log('Creando tabla Publicaciones...');
        await pool.query(`
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
        await pool.query(`
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
        await pool.query(`
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
        await pool.query(`
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
        await pool.query(`
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
        await pool.query(`
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
        await pool.query(`
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
        await pool.query(`
          INSERT IGNORE INTO Categorias (Nombre_categoria, Descripcion) VALUES 
          ('Noticias', 'Últimas noticias y novedades sobre educación y tecnología'),
          ('Técnicas de Estudio', 'Estrategias y métodos para mejorar el aprendizaje'),
          ('Problemáticas en el Estudio', 'Dificultades y retos comunes en el aprendizaje'),
          ('Educación de Calidad', 'Mejores prácticas y estándares para una educación efectiva'),
          ('Herramientas Tecnológicas', 'Tecnología y recursos para mejorar la enseñanza'),
          ('Desarrollo Profesional Docente', 'Capacitación y crecimiento profesional para docentes'),
          ('Comunidad y Colaboración', 'Interacción y trabajo en equipo en el ámbito educativo')
        `);

    console.log('Migraciones completadas');
  } catch (error) {
    console.error('Error en migraciones:', error);
  }
}

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3002', 'https://www.educstation.com', 'https://educstation.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/categorias', categoriasRoutes);


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