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

module.exports = router; 