const Publicacion = require('../models/publicacionesModel');
const Categoria = require('../models/categoriasModel');
const { validationResult } = require('express-validator');

/**
 * @desc    Buscar publicaciones por término simple (título, contenido o resumen)
 * @route   GET /api/search
 * @access  Público
 * @param   {string} req.query.q - Término de búsqueda
 * @param   {number} req.query.limit - Número de resultados a retornar (opcional, default: 10)
 * @param   {number} req.query.page - Página de resultados (opcional, default: 1)
 * @returns {Array} Lista de publicaciones que coinciden con el término
 */
const searchPublicaciones = async (req, res) => {
    try {
        const { q, limit = 10, page = 1 } = req.query;

        if (!q) {
            return res.status(400).json({
                status: 'error',
                message: 'Es necesario proporcionar un término de búsqueda (q)'
            });
        }

        // Calcular offset para paginación
        const offset = (page - 1) * limit;

        // Realizar búsqueda
        const resultados = await Publicacion.search(q, parseInt(limit), parseInt(offset));

        // Obtener el total de resultados para la paginación
        const total = await Publicacion.countSearchResults(q);

        res.json({
            status: 'success',
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            results: resultados
        });
    } catch (error) {
        console.error('Error en búsqueda de publicaciones:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al buscar publicaciones'
        });
    }
};

/**
 * @desc    Buscar publicaciones con filtrado y ordenamiento avanzados
 * @route   POST /api/search/advanced
 * @access  Público
 * @param   {string} req.body.term - Término de búsqueda (opcional)
 * @param   {Array} req.body.categorias - IDs de categorías para filtrar (opcional)
 * @param   {Date} req.body.fechaDesde - Fecha desde (opcional)
 * @param   {Date} req.body.fechaHasta - Fecha hasta (opcional)
 * @param   {string} req.body.estado - Estado de publicación (opcional)
 * @param   {string} req.body.orderBy - Campo para ordenar resultados (opcional)
 * @param   {string} req.body.orderDir - Dirección de ordenamiento: 'asc' o 'desc' (opcional)
 * @param   {number} req.body.limit - Número de resultados a retornar (opcional)
 * @param   {number} req.body.page - Página de resultados (opcional)
 * @returns {Array} Lista de publicaciones que coinciden con los criterios
 */
const advancedSearch = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const {
            term = '',
            categorias = [],
            fechaDesde,
            fechaHasta,
            estado,
            orderBy = 'Fecha_creacion',
            orderDir = 'desc',
            limit = 10,
            page = 1
        } = req.body;

        // Validar ordenamiento
        const validOrderFields = ['Titulo', 'Fecha_creacion', 'Fecha_modificacion'];
        const validOrderDirs = ['asc', 'desc'];

        if (!validOrderFields.includes(orderBy)) {
            return res.status(400).json({
                status: 'error',
                message: `Campo de ordenamiento inválido. Valores permitidos: ${validOrderFields.join(', ')}`
            });
        }

        if (!validOrderDirs.includes(orderDir.toLowerCase())) {
            return res.status(400).json({
                status: 'error',
                message: 'Dirección de ordenamiento inválida. Valores permitidos: asc, desc'
            });
        }

        // Calcular offset para paginación
        const offset = (page - 1) * limit;

        // Construir criterios de búsqueda
        const searchCriteria = {
            term,
            categorias: categorias.map(id => parseInt(id)),
            fechaDesde: fechaDesde ? new Date(fechaDesde) : null,
            fechaHasta: fechaHasta ? new Date(fechaHasta) : null,
            estado,
            orderBy,
            orderDir: orderDir.toLowerCase(),
            limit: parseInt(limit),
            offset: parseInt(offset)
        };

        // Realizar búsqueda avanzada
        const resultados = await Publicacion.advancedSearch(searchCriteria);

        // Obtener el total de resultados para la paginación
        const total = await Publicacion.countAdvancedSearchResults(searchCriteria);

        res.json({
            status: 'success',
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            filters: {
                term,
                categorias,
                fechaDesde,
                fechaHasta,
                estado
            },
            sorting: {
                orderBy,
                orderDir
            },
            results: resultados
        });
    } catch (error) {
        console.error('Error en búsqueda avanzada:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al realizar búsqueda avanzada'
        });
    }
};

/**
 * @desc    Buscar publicaciones por etiquetas/categorías
 * @route   GET /api/search/tag/:tagId
 * @access  Público
 * @param   {string} req.params.tagId - ID de la categoría
 * @param   {number} req.query.limit - Número de resultados a retornar (opcional)
 * @param   {number} req.query.page - Página de resultados (opcional)
 * @returns {Array} Lista de publicaciones asociadas a la categoría
 */
const searchByTag = async (req, res) => {
    try {
        const { tagId } = req.params;
        const { limit = 10, page = 1 } = req.query;

        // Verificar si existe la categoría
        const categoria = await Categoria.findById(tagId);
        if (!categoria) {
            return res.status(404).json({
                status: 'error',
                message: 'Categoría no encontrada'
            });
        }

        // Calcular offset para paginación
        const offset = (page - 1) * limit;

        // Obtener publicaciones por categoría con paginación
        const publicaciones = await Categoria.getPublicacionesPaginated(
            tagId,
            parseInt(limit),
            parseInt(offset)
        );

        // Obtener el total de publicaciones para esta categoría
        const total = await Categoria.countPublicaciones(tagId);

        res.json({
            status: 'success',
            categoria: categoria.Nombre_categoria,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit),
            results: publicaciones
        });
    } catch (error) {
        console.error('Error al buscar por etiqueta:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al buscar por etiqueta'
        });
    }
};

/**
 * @desc    Obtener las categorías más usadas/populares
 * @route   GET /api/search/trending-tags
 * @access  Público
 * @param   {number} req.query.limit - Número de categorías a retornar (opcional)
 * @returns {Array} Lista de categorías populares con conteo de publicaciones
 */
const getTrendingTags = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const popularTags = await Categoria.getPopularCategories(parseInt(limit));

        res.json({
            status: 'success',
            results: popularTags
        });
    } catch (error) {
        console.error('Error al obtener etiquetas populares:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al obtener etiquetas populares'
        });
    }
};

module.exports = {
    searchPublicaciones,
    advancedSearch,
    searchByTag,
    getTrendingTags
};