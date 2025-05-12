const express = require('express');
const router = express.Router();
const publicacionesController = require('../controllers/publicacionesController');
const { publicacionValidator, htmlPublicacionValidator } = require('../middleware/validators');

// Rutas públicas
router.get('/', publicacionesController.getAllPublicaciones);
router.get('/search', publicacionesController.searchPublicaciones);
router.get('/:id', publicacionesController.getPublicacionById);

// Rutas de creación y modificación (sin autenticación)
router.post('/', publicacionValidator, publicacionesController.createPublicacion);
router.post('/from-html', htmlPublicacionValidator, publicacionesController.createPublicacionFromHTML);
router.put('/:id', publicacionValidator, publicacionesController.updatePublicacion);
router.delete('/:id', publicacionesController.deletePublicacion);

// Rutas de búsqueda específica
router.get('/search/title', publicacionesController.searchByTitle);
router.get('/search/content', publicacionesController.searchByContent);
router.get('/search/tags', publicacionesController.searchByTags);
router.get('/search/advanced', publicacionesController.advancedSearch);

module.exports = router; 