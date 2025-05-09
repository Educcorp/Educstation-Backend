const express = require('express');
const router = express.Router();
const publicacionesController = require('../controllers/publicacionesController');
const { publicacionValidator } = require('../middleware/validators');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/', publicacionesController.getAllPublicaciones);
router.get('/count', publicacionesController.countPublicaciones);
router.get('/search', publicacionesController.searchPublicaciones);
router.get('/search/advanced', publicacionesController.advancedSearchPublicaciones);
router.get('/:id', publicacionesController.getPublicacionById);
router.get('/:id/comentarios', publicacionesController.getComentarios);

// Rutas protegidas (solo administradores)
router.post('/', authenticateToken, isAdmin, publicacionValidator, publicacionesController.createPublicacion);
router.put('/:id', authenticateToken, isAdmin, publicacionValidator, publicacionesController.updatePublicacion);
router.delete('/:id', authenticateToken, isAdmin, publicacionesController.deletePublicacion);

module.exports = router;