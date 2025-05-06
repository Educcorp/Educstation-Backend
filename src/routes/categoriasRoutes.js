const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Validadores
const categoriaValidator = [
  body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ max: 50 }).withMessage('El nombre no puede exceder los 50 caracteres'),
  body('descripcion').trim().notEmpty().withMessage('La descripción es requerida').isLength({ max: 255 }).withMessage('La descripción no puede exceder los 255 caracteres')
];

// Rutas públicas
router.get('/', categoriasController.getAllCategorias);
router.get('/:id', categoriasController.getCategoriaById);
router.get('/:id/publicaciones', categoriasController.getPublicacionesByCategoria);

// Rutas protegidas (solo administradores)
router.post('/', authenticateToken, isAdmin, categoriaValidator, categoriasController.createCategoria);
router.put('/:id', authenticateToken, isAdmin, categoriaValidator, categoriasController.updateCategoria);
router.delete('/:id', authenticateToken, isAdmin, categoriasController.deleteCategoria);

module.exports = router;