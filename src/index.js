const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mysql = require('mysql2/promise');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
// Importa las demás rutas según las necesites

// Función para ejecutar migraciones
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

    // Crear la base de datos si no existe
    console.log(`Creando base de datos ${dbName} si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Base de datos ${dbName} verificada/creada.`);
    
    // Cerrar la conexión actual
    await connection.end();
    
    // Crear una nueva conexión especificando la base de datos
    if (process.env.MYSQL_URL) {
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
    
    // A partir de aquí, colocas todas tus migraciones de tablas
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
    
    // Aquí agregas todas las demás tablas que están en tu archivo migrations.js
    // ...

    console.log('Migraciones completadas con éxito!');
    return true;
  } catch (error) {
    console.error('Error al ejecutar migraciones:', error);
    return false;
  } finally {
    // Cerrar conexión
    if (connection) await connection.end();
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
app.use('/api/categorias', categoriasRoutes);
// Agrega las demás rutas según las necesites

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

// Iniciar el servidor y las migraciones
const PORT = process.env.PORT || 3000;

// Función principal asíncrona para iniciar todo en el orden correcto
async function startServer() {
  // Primero ejecutamos las migraciones
  await runMigrations();
  
  // Después iniciamos el servidor
  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
    
    // Probar conexión a la base de datos al iniciar
    await testConnection();
  });
}

// Iniciar todo
startServer().catch(error => {
  console.error('Error al iniciar el servidor:', error);
});

// Manejo de excepciones no capturadas
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Promesa rechazada no manejada:', error);
});