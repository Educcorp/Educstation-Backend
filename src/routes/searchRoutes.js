const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { body } = require('express-validator');

/**
 * Validadores para la búsqueda avanzada
 */
const advancedSearchValidators = [
    body('term').optional().isString().withMessage('El término de búsqueda debe ser texto'),
    body('categorias').optional().isArray().withMessage('Las categorías deben ser un array'),
    body('categorias.*').optional().isNumeric().withMessage('Los IDs de categorías deben ser numéricos'),
    body('fechaDesde').optional().isISO8601().withMessage('La fecha desde debe tener formato válido'),
    body('fechaHasta').optional().isISO8601().withMessage('La fecha hasta debe tener formato válido'),
    body('estado').optional().isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),
    body('orderBy').optional().isString().withMessage('El campo de ordenamiento debe ser texto'),
    body('orderDir').optional().isIn(['asc', 'desc']).withMessage('La dirección debe ser asc o desc'),
    body('limit').optional().isInt({ min: 1, max: 100 }).withMessage('El límite debe estar entre 1 y 100'),
    body('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo')
];

/**
 * @route   GET /api/search
 * @desc    Buscar publicaciones por término simple
 * @access  Público
 */
router.get('/', searchController.searchPublicaciones);

/**
 * @route   POST /api/search/advanced
 * @desc    Buscar publicaciones con filtrado y ordenamiento avanzados
 * @access  Público
 */
router.post('/advanced', advancedSearchValidators, searchController.advancedSearch);

/**
 * @route   GET /api/search/tag/:tagId
 * @desc    Buscar publicaciones por etiqueta/categoría
 * @access  Público
 */
router.get('/tag/:tagId', searchController.searchByTag);

/**
 * @route   GET /api/search/trending-tags
 * @desc    Obtener las categorías más populares
 * @access  Público
 */
router.get('/trending-tags', searchController.getTrendingTags);

module.exports = router;