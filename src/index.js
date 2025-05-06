const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

// Inicializar app
const app = express();

const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${req.method} ${req.originalUrl}`);
    }
    next();
  });

// Middleware
app.use(cors({
  origin: [
    'https://educstation.com',
    'https://www.educstation.com',
    'http://localhost:3000',
    'https://entornocorp-production.up.railway.app'
  ],
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// Limitar peticiones
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 peticiones por ventana
});
app.use('/api/', apiLimiter);

// Rutas
app.use('/api', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'EducStation API funcionando correctamente' });
});

// Iniciar servidor
async function startServer() {
  // Probar conexión a la base de datos
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } else {
    console.error('No se pudo iniciar el servidor debido a problemas con la base de datos');
    process.exit(1);
  }
}

process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (error) => {
    console.error('Promesa rechazada no manejada:', error);
    process.exit(1);
  });
  
  // También, al iniciar el servidor, añade más logs:
  async function startServer() {
    try {
      // Probar conexión a la base de datos
      console.log('Intentando conectar a la base de datos...');
      console.log(`Host: ${process.env.DB_HOST}, Puerto: ${process.env.DB_PORT}, Usuario: ${process.env.DB_USER}, DB: ${process.env.DB_NAME}`);
      
      const dbConnected = await testConnection();
      
      if (dbConnected) {
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`Servidor corriendo en el puerto ${PORT}`);
          console.log('Variables de entorno cargadas:', {
            nodeEnv: process.env.NODE_ENV,
            port: process.env.PORT,
            dbHost: process.env.DB_HOST ? 'Configurado' : 'Falta',
            dbUser: process.env.DB_USER ? 'Configurado' : 'Falta',
            jwtSecret: process.env.JWT_SECRET ? 'Configurado' : 'Falta'
          });
        });
      } else {
        console.error('No se pudo iniciar el servidor debido a problemas con la base de datos');
        process.exit(1);
      }
    } catch (error) {
      console.error('Error al iniciar el servidor:', error);
      process.exit(1);
    }
  }
  
startServer();