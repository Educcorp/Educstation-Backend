const express = require('express');
const router = express.Router();
const publicacionesController = require('../controllers/publicacionesController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { publicacionValidator, htmlPublicacionValidator } = require('../middleware/validators');

// Rutas públicas
router.get('/', publicacionesController.getAllPublicaciones);
router.get('/search', publicacionesController.searchPublicaciones);
router.get('/:id', publicacionesController.getPublicacionById);

// Rutas protegidas (solo administradores)
router.post('/', authenticateToken, isAdmin, publicacionValidator, publicacionesController.createPublicacion);
router.post('/from-html', authenticateToken, isAdmin, htmlPublicacionValidator, publicacionesController.createPublicacionFromHTML);
router.put('/:id', authenticateToken, isAdmin, publicacionValidator, publicacionesController.updatePublicacion);
router.delete('/:id', authenticateToken, isAdmin, publicacionesController.deletePublicacion);

module.exports = router; 