const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

// Inicializar app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3002', 'https://www.educstation.com', 'http://127.0.0.1:3000', 'http://127.0.0.1:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Aumentamos significativamente los límites para manejar imágenes grandes
app.use(express.json({ 
  limit: '50mb',
  extended: true,
  parameterLimit: 50000
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '50mb',
  parameterLimit: 50000
}));

// Middleware de debugging para ver todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // No logueamos todos los headers para evitar sobrecarga, solo algunos relevantes
  const relevantHeaders = {
    'content-type': req.headers['content-type'],
    'authorization': req.headers['authorization'] ? 'Presente' : 'No presente',
    'x-auth-token': req.headers['x-auth-token'] ? 'Presente' : 'No presente',
    'content-length': req.headers['content-length']
  };
  
  console.log('Headers relevantes:', relevantHeaders);
  
  // Tamaño del cuerpo si está presente
  if (req.headers['content-length']) {
    console.log(`Tamaño del cuerpo: ${Math.round(req.headers['content-length']/1024)} KB`);
  }
  
  next();
});

// Rutas
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API EducStation funcionando correctamente');
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(500).json({ 
    detail: 'Error en el servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));

module.exports = app; 