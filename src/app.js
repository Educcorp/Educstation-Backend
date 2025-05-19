const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
// ... otros imports ...

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde el directorio de uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', authRoutes);
// ... otras rutas ...

module.exports = app; 