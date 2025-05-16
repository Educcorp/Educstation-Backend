const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { param, query } = require('express-validator');
const { categoriaCreateValidator, categoriaUpdateValidator } = require('../middleware/validators');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

/**
 * Validador para ID de categoría
 */
const idValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

/**
 * @api {get} /api/categorias Obtener todas las categorías
 * @apiName GetAllCategorias
 * @apiGroup Categorias
 * @apiDescription Obtiene la lista completa de categorías disponibles
 * 
 * @apiSuccess {Object[]} categorias Lista de todas las categorías
 * @apiSuccess {Number} categorias.ID_categoria ID único de la categoría
 * @apiSuccess {String} categorias.Nombre_categoria Nombre de la categoría
 * @apiSuccess {String} categorias.Descripcion Descripción de la categoría
 */
router.get('/', categoriasController.getAllCategorias);

/**
 * @api {get} /api/categorias/search Buscar categorías
 * @apiName SearchCategorias
 * @apiGroup Categorias
 * @apiDescription Busca categorías por nombre
 * 
 * @apiQuery {String} nombre Nombre o parte del nombre a buscar
 * 
 * @apiSuccess {Object[]} categorias Lista de categorías que coinciden con la búsqueda
 */
router.get('/search', [
  query('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser texto')
    .trim()
], categoriasController.searchCategorias);

/**
 * @api {get} /api/categorias/stats Obtener estadísticas de categorías
 * @apiName GetCategoriasStats
 * @apiGroup Categorias
 * @apiDescription Obtiene estadísticas de las categorías, como el número de publicaciones en cada una
 * 
 * @apiSuccess {Object[]} stats Estadísticas de categorías
 * @apiSuccess {Number} stats.ID_categoria ID de la categoría
 * @apiSuccess {String} stats.Nombre_categoria Nombre de la categoría
 * @apiSuccess {Number} stats.publicaciones_count Número de publicaciones en la categoría
 */
router.get('/stats', categoriasController.getCategoriaStats);

/**
 * @api {get} /api/categorias/:id Obtener categoría por ID
 * @apiName GetCategoriaById
 * @apiGroup Categorias
 * @apiDescription Obtiene detalles de una categoría específica
 * 
 * @apiParam {Number} id ID de la categoría
 * 
 * @apiSuccess {Object} categoria Detalles de la categoría
 * @apiSuccess {Number} categoria.ID_categoria ID único de la categoría
 * @apiSuccess {String} categoria.Nombre_categoria Nombre de la categoría
 * @apiSuccess {String} categoria.Descripcion Descripción de la categoría
 * 
 * @apiError {Object} error Error si la categoría no existe
 */
router.get('/:id', idValidator, categoriasController.getCategoriaById);

/**
 * @api {get} /api/categorias/:id/publicaciones Obtener publicaciones por categoría
 * @apiName GetPublicacionesByCategoria
 * @apiGroup Categorias
 * @apiDescription Obtiene todas las publicaciones asociadas a una categoría
 * 
 * @apiParam {Number} id ID de la categoría
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones en la categoría
 * 
 * @apiError {Object} error Error si la categoría no existe
 */
router.get('/:id/publicaciones', idValidator, categoriasController.getPublicacionesByCategoria);

/**
 * @api {post} /api/categorias Crear nueva categoría
 * @apiName CreateCategoria
 * @apiGroup Categorias
 * @apiDescription Crea una nueva categoría
 * 
 * @apiBody {String} nombre Nombre de la categoría (máx. 50 caracteres)
 * @apiBody {String} descripcion Descripción de la categoría (máx. 255 caracteres)
 * 
 * @apiSuccess {Object} categoria Categoría creada
 * @apiSuccess {Number} categoria.ID_categoria ID único de la categoría creada
 * @apiSuccess {String} categoria.Nombre_categoria Nombre de la categoría
 * @apiSuccess {String} categoria.Descripcion Descripción de la categoría
 * 
 * @apiError {Object} errors Lista de errores de validación
 * @apiError {Object} error Error si ya existe una categoría con ese nombre
 */
router.post('/', authenticateToken, isAdmin, categoriaCreateValidator, categoriasController.createCategoria);

/**
 * @api {put} /api/categorias/:id Actualizar categoría
 * @apiName UpdateCategoria
 * @apiGroup Categorias
 * @apiDescription Actualiza una categoría existente
 * 
 * @apiParam {Number} id ID de la categoría
 * @apiBody {String} nombre Nombre de la categoría (máx. 50 caracteres)
 * @apiBody {String} descripcion Descripción de la categoría (máx. 255 caracteres)
 * 
 * @apiSuccess {Object} categoria Categoría actualizada
 * 
 * @apiError {Object} errors Lista de errores de validación
 * @apiError {Object} error Error si la categoría no existe
 * @apiError {Object} error Error si ya existe otra categoría con ese nombre
 */
router.put('/:id', authenticateToken, isAdmin, [...idValidator, ...categoriaUpdateValidator], categoriasController.updateCategoria);

/**
 * @api {delete} /api/categorias/:id Eliminar categoría
 * @apiName DeleteCategoria
 * @apiGroup Categorias
 * @apiDescription Elimina una categoría existente
 * 
 * @apiParam {Number} id ID de la categoría
 * 
 * @apiSuccess {Object} message Mensaje de confirmación de eliminación
 * 
 * @apiError {Object} error Error si la categoría no existe
 */
router.delete('/:id', authenticateToken, isAdmin, idValidator, categoriasController.deleteCategoria);

module.exports = router;