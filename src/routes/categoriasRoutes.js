const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

/**
 * Validadores para la creación y actualización de categorías
 * - nombre: requerido, máx 50 caracteres, único
 * - descripcion: requerida, máx 255 caracteres
 */
const categoriaValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre de la categoría es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder los 50 caracteres')
    .matches(/^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s]+$/).withMessage('El nombre solo puede contener letras, números y espacios'),

  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder los 255 caracteres')
];

/**
 * @route   GET /api/categorias
 * @desc    Obtener todas las categorías
 * @access  Público
 */
router.get('/', categoriasController.getAllCategorias);

/**
 * @route   GET /api/categorias/:id
 * @desc    Obtener una categoría por su ID
 * @access  Público
 */
router.get('/:id', categoriasController.getCategoriaById);

/**
 * @route   GET /api/categorias/:id/publicaciones
 * @desc    Obtener publicaciones asociadas a una categoría
 * @access  Público
 */
router.get('/:id/publicaciones', categoriasController.getPublicacionesByCategoria);

/**
 * @route   POST /api/categorias
 * @desc    Crear una nueva categoría
 * @access  Privado - Solo Administradores
 */
router.post('/',
  authenticateToken,
  isAdmin,
  categoriaValidator,
  categoriasController.createCategoria
);

/**
 * @route   PUT /api/categorias/:id
 * @desc    Actualizar una categoría existente
 * @access  Privado - Solo Administradores
 */
router.put('/:id',
  authenticateToken,
  isAdmin,
  categoriaValidator,
  categoriasController.updateCategoria
);

/**
 * @route   DELETE /api/categorias/:id
 * @desc    Eliminar una categoría
 * @access  Privado - Solo Administradores
 */
router.delete('/:id',
  authenticateToken,
  isAdmin,
  categoriasController.deleteCategoria
);

module.exports = router;