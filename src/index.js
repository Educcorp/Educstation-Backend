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
const PORT = process.env.PORT || 5000;

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

startServer();