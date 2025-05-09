// src/routes/searchRoutes.js - Nuevo archivo

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Ruta para búsqueda básica
router.get('/', searchController.searchPublicaciones);

// Ruta para búsqueda avanzada
router.post('/advanced', searchController.advancedSearch);

// Ruta para obtener etiquetas populares
router.get('/tags', searchController.getPopularTags);

module.exports = router;