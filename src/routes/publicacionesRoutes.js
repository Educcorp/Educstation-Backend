const express = require('express');
const router = express.Router();
const publicacionesController = require('../controllers/publicacionesController');
const { publicacionValidator, htmlPublicacionValidator } = require('../middleware/validators');
const { param } = require('express-validator');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Validador para ID de publicación
const idValidator = [
    param('id')
        .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
];

/**
 * @api {get} /api/publicaciones Obtener todas las publicaciones
 * @apiName GetAllPublicaciones
 * @apiGroup Publicaciones
 * @apiDescription Retorna la lista de publicaciones con paginación y filtrado opcional
 * 
 * @apiQuery {Number} [limite=10] Cantidad de resultados a retornar
 * @apiQuery {Number} [offset=0] Número de resultados a omitir (para paginación)
 * @apiQuery {String} [estado] Filtrar por estado (borrador, publicado, archivado)
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones
 */
router.get('/', publicacionesController.getAllPublicaciones);

/**
 * @api {get} /api/publicaciones/latest Obtener las últimas publicaciones
 * @apiName GetLatestPublicaciones
 * @apiGroup Publicaciones
 * @apiDescription Retorna las últimas publicaciones publicadas (método alternativo y simplificado)
 * 
 * @apiQuery {Number} [limite=10] Cantidad de resultados a retornar
 * 
 * @apiSuccess {Object[]} publicaciones Lista de las últimas publicaciones
 */
router.get('/latest', publicacionesController.getLatestPublicaciones);

/**
 * @api {get} /api/publicaciones/search Búsqueda general
 * @apiName SearchPublicaciones
 * @apiGroup Publicaciones
 * @apiDescription Busca publicaciones por término en título, contenido y resumen
 * 
 * @apiQuery {String} term Término de búsqueda
 * @apiQuery {Number} [limite=10] Cantidad de resultados a retornar
 * @apiQuery {Number} [offset=0] Número de resultados a omitir (para paginación)
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones que coinciden con el término
 */
router.get('/search', publicacionesController.searchPublicaciones);

/**
 * @api {get} /api/publicaciones/search/title Búsqueda por título
 * @apiName SearchByTitle
 * @apiGroup Publicaciones
 * @apiDescription Busca publicaciones por término en el título
 * 
 * @apiQuery {String} term Término de búsqueda
 * @apiQuery {Number} [limite=10] Cantidad de resultados a retornar
 * @apiQuery {Number} [offset=0] Número de resultados a omitir (para paginación)
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones que coinciden en el título
 */
router.get('/search/title', publicacionesController.searchByTitle);

/**
 * @api {get} /api/publicaciones/search/content Búsqueda por contenido
 * @apiName SearchByContent
 * @apiGroup Publicaciones
 * @apiDescription Busca publicaciones por término en el contenido
 * 
 * @apiQuery {String} term Término de búsqueda
 * @apiQuery {Number} [limite=10] Cantidad de resultados a retornar
 * @apiQuery {Number} [offset=0] Número de resultados a omitir (para paginación)
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones que coinciden en el contenido
 */
router.get('/search/content', publicacionesController.searchByContent);

/**
 * @api {get} /api/publicaciones/search/tags Búsqueda por categorías
 * @apiName SearchByTags
 * @apiGroup Publicaciones
 * @apiDescription Busca publicaciones por categorías/etiquetas
 * 
 * @apiQuery {String} categorias IDs de categorías separadas por comas (ej: 1,2,3)
 * @apiQuery {Number} [limite=10] Cantidad de resultados a retornar
 * @apiQuery {Number} [offset=0] Número de resultados a omitir (para paginación)
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones que pertenecen a las categorías especificadas
 */
router.get('/search/tags', publicacionesController.searchByTags);

/**
 * @api {get} /api/publicaciones/search/advanced Búsqueda avanzada
 * @apiName AdvancedSearch
 * @apiGroup Publicaciones
 * @apiDescription Búsqueda avanzada con múltiples criterios
 * 
 * @apiQuery {String} [titulo] Buscar en el título
 * @apiQuery {String} [contenido] Buscar en el contenido
 * @apiQuery {String} [fechaDesde] Filtrar desde esta fecha (formato: YYYY-MM-DD)
 * @apiQuery {String} [fechaHasta] Filtrar hasta esta fecha (formato: YYYY-MM-DD)
 * @apiQuery {String} [estado] Filtrar por estado (borrador, publicado, archivado)
 * @apiQuery {String} [categorias] IDs de categorías separadas por comas (ej: 1,2,3)
 * @apiQuery {String} [ordenarPor] Ordenamiento (titulo_asc, titulo_desc, fecha_asc, fecha_desc)
 * @apiQuery {Number} [limite=10] Cantidad de resultados a retornar
 * @apiQuery {Number} [offset=0] Número de resultados a omitir (para paginación)
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones filtradas según los criterios
 */
router.get('/search/advanced', publicacionesController.advancedSearch);

/**
 * @api {get} /api/publicaciones/:id Obtener publicación por ID
 * @apiName GetPublicacionById
 * @apiGroup Publicaciones
 * @apiDescription Obtiene los detalles de una publicación específica
 * 
 * @apiParam {Number} id ID de la publicación
 * 
 * @apiSuccess {Object} publicacion Detalles de la publicación
 * @apiSuccess {Object[]} categorias Categorías asociadas a la publicación
 * @apiSuccess {Object[]} imagenes Imágenes asociadas a la publicación
 */
router.get('/:id', idValidator, publicacionesController.getPublicacionById);

/**
 * @api {post} /api/publicaciones Crear nueva publicación
 * @apiName CreatePublicacion
 * @apiGroup Publicaciones
 * @apiDescription Crea una nueva publicación
 * 
 * @apiBody {String} titulo Título de la publicación
 * @apiBody {String} contenido Contenido de la publicación
 * @apiBody {String} [resumen] Resumen de la publicación
 * @apiBody {String} [estado=borrador] Estado (borrador, publicado, archivado)
 * @apiBody {Number[]} [categorias] Lista de IDs de categorías
 * 
 * @apiSuccess {Object} result Objeto con ID de la publicación creada y mensaje
 */
router.post('/', authenticateToken, publicacionValidator, publicacionesController.createPublicacion);

/**
 * @api {post} /api/publicaciones/from-html Crear publicación desde HTML
 * @apiName CreatePublicacionFromHTML
 * @apiGroup Publicaciones
 * @apiDescription Crea una nueva publicación a partir de contenido HTML
 * 
 * @apiBody {String} titulo Título de la publicación
 * @apiBody {String} htmlContent Contenido HTML de la publicación
 * @apiBody {String} [resumen] Resumen de la publicación
 * @apiBody {String} [estado=borrador] Estado (borrador, publicado, archivado)
 * @apiBody {Number[]} [categorias] Lista de IDs de categorías
 * 
 * @apiSuccess {Object} result Objeto con ID de la publicación creada y mensaje
 */
router.post('/from-html', authenticateToken, htmlPublicacionValidator, publicacionesController.createPublicacionFromHTML);

/**
 * @api {put} /api/publicaciones/:id Actualizar publicación
 * @apiName UpdatePublicacion
 * @apiGroup Publicaciones
 * @apiDescription Actualiza una publicación existente
 * 
 * @apiParam {Number} id ID de la publicación
 * @apiBody {String} titulo Título de la publicación
 * @apiBody {String} contenido Contenido de la publicación
 * @apiBody {String} [resumen] Resumen de la publicación
 * @apiBody {String} [estado] Estado (borrador, publicado, archivado)
 * @apiBody {Number[]} [categorias] Lista de IDs de categorías
 * 
 * @apiSuccess {Object} message Mensaje de confirmación
 */
router.put('/:id', authenticateToken, [...idValidator, ...publicacionValidator], publicacionesController.updatePublicacion);

/**
 * @api {delete} /api/publicaciones/:id Eliminar publicación
 * @apiName DeletePublicacion
 * @apiGroup Publicaciones
 * @apiDescription Elimina una publicación existente
 * 
 * @apiParam {Number} id ID de la publicación
 * 
 * @apiSuccess {Object} message Mensaje de confirmación
 */
router.delete('/:id', authenticateToken, idValidator, publicacionesController.deletePublicacion);

/**
 * @api {get} /api/publicaciones/user/me Obtener publicaciones del usuario autenticado
 * @apiName GetUserPublicaciones
 * @apiGroup Publicaciones
 * @apiDescription Obtiene las publicaciones creadas por el usuario autenticado
 * 
 * @apiQuery {Number} [limite=5] Cantidad de resultados a retornar
 * @apiQuery {Number} [offset=0] Número de resultados a omitir (para paginación)
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones del usuario
 */
router.get('/user/me', authenticateToken, publicacionesController.getPublicacionesByUserId);

/**
 * @api {get} /api/publicaciones/admin/debug Debug admin info
 * @apiName DebugAdminInfo
 * @apiGroup Publicaciones
 * @apiDescription Debug endpoint to check admin ID and user info
 */
router.get('/admin/debug', authenticateToken, isAdmin, (req, res) => {
  try {
    res.json({
      userId: req.userId,
      adminId: req.adminId,
      user: req.user,
      message: 'Debug information for admin user'
    });
  } catch (error) {
    res.status(500).json({ detail: 'Error en el servidor', error: error.message });
  }
});

/**
 * @api {get} /api/publicaciones/admin/me Obtener publicaciones del administrador autenticado
 * @apiName GetAdminPublicaciones
 * @apiGroup Publicaciones
 * @apiDescription Obtiene las publicaciones creadas por el administrador autenticado, ordenadas por fecha de modificación o creación
 * 
 * @apiQuery {Number} [limite=100] Cantidad de resultados a retornar
 * @apiQuery {Number} [offset=0] Número de resultados a omitir (para paginación)
 * 
 * @apiSuccess {Object[]} publicaciones Lista de publicaciones del administrador
 */
router.get('/admin/me', authenticateToken, isAdmin, publicacionesController.getPublicacionesByAdminId);

module.exports = router;