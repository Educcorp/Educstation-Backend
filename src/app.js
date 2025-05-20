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
app.use(express.json({ limit: '50mb' })); // Aumentamos el límite para imágenes base64
app.use(express.urlencoded({ extended: false }));

// Middleware de debugging para ver todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Rutas
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API EducStation funcionando correctamente');
});

// Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));

module.exports = app; 