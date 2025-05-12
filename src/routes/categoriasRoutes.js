const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const { body, param } = require('express-validator');

/**
 * Validadores para categorías
 */
const categoriaValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 50 }).withMessage('El nombre no puede exceder los 50 caracteres'),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es requerida')
    .isLength({ max: 255 }).withMessage('La descripción no puede exceder los 255 caracteres')
];

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
router.post('/', categoriaValidator, categoriasController.createCategoria);

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
router.put('/:id', [...idValidator, ...categoriaValidator], categoriasController.updateCategoria);

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
router.delete('/:id', idValidator, categoriasController.deleteCategoria);

module.exports = router;