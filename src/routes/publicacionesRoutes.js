const express = require('express');
const router = express.Router();
const publicacionesController = require('../controllers/publicacionesController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

/**
 * Validadores para las publicaciones
 */
const publicacionValidator = [
    body('titulo')
        .trim()
        .notEmpty().withMessage('El título es requerido')
        .isLength({ max: 100 }).withMessage('El título no puede exceder los 100 caracteres'),

    body('contenido')
        .trim()
        .notEmpty().withMessage('El contenido es requerido'),

    body('resumen')
        .trim()
        .optional()
        .isLength({ max: 500 }).withMessage('El resumen no puede exceder los 500 caracteres'),

    body('estado')
        .optional()
        .isIn(['borrador', 'publicado', 'archivado']).withMessage('Estado inválido'),

    body('categorias')
        .optional()
        .isArray().withMessage('Las categorías deben ser un array')
];

/**
 * @route   GET /api/publicaciones
 * @desc    Obtener todas las publicaciones
 * @access  Público
 */
router.get('/', publicacionesController.getAllPublicaciones);

/**
 * @route   GET /api/publicaciones/:id
 * @desc    Obtener una publicación por ID
 * @access  Público
 */
router.get('/:id', publicacionesController.getPublicacionById);

/**
 * @route   POST /api/publicaciones
 * @desc    Crear una nueva publicación
 * @access  Privado - Solo Administradores
 */
router.post(
    '/',
    authenticateToken,
    isAdmin,
    publicacionValidator,
    publicacionesController.createPublicacion
);

/**
 * @route   PUT /api/publicaciones/:id
 * @desc    Actualizar una publicación existente
 * @access  Privado - Solo Administradores
 */
router.put(
    '/:id',
    authenticateToken,
    isAdmin,
    publicacionValidator,
    publicacionesController.updatePublicacion
);

/**
 * @route   DELETE /api/publicaciones/:id
 * @desc    Eliminar una publicación
 * @access  Privado - Solo Administradores
 */
router.delete(
    '/:id',
    authenticateToken,
    isAdmin,
    publicacionesController.deletePublicacion
);

/**
 * @route   GET /api/publicaciones/:id/comentarios
 * @desc    Obtener los comentarios de una publicación
 * @access  Público
 */
router.get('/:id/comentarios', publicacionesController.getComentarios);

module.exports = router;