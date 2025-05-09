const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { body, param, query } = require('express-validator');

// Validadores
const categoriaValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder los 50 caracteres')
    .matches(/^[\w\s\-áéíóúÁÉÍÓÚñÑ]+$/).withMessage('El nombre contiene caracteres no permitidos'),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder los 255 caracteres')
];

const searchValidator = [
  query('term').notEmpty().withMessage('El término de búsqueda es requerido'),
  query('limite').optional().isInt({ min: 1 }).withMessage('El límite debe ser un número positivo'),
  query('offset').optional().isInt({ min: 0 }).withMessage('El offset debe ser un número no negativo'),
  query('orderBy').optional().isIn(['Nombre_categoria', 'ID_categoria']).withMessage('Campo de ordenamiento no válido'),
  query('orderDir').optional().isIn(['asc', 'desc']).withMessage('Dirección de ordenamiento no válida')
];

// Rutas públicas
router.get('/', categoriasController.getAllCategorias);
router.get('/stats', categoriasController.getCategoriasStats);
router.get('/search', searchValidator, categoriasController.searchCategorias);
router.get('/:id', categoriasController.getCategoriaById);
router.get('/:id/publicaciones', categoriasController.getPublicacionesByCategoria);

// Rutas de creación y modificación (con validación mejorada)
router.post('/', categoriaValidator, categoriasController.createCategoria);
router.put('/:id', categoriaValidator, categoriasController.updateCategoria);
router.delete('/:id', categoriasController.deleteCategoria);

module.exports = router;