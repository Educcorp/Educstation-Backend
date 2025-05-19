const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

// Inicializar app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Aumentamos el límite para imágenes base64
app.use(express.urlencoded({ extended: false }));

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