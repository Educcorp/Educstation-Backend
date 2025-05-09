// src/controllers/searchController.js - Nuevo archivo

const Publicacion = require('../models/publicacionesModel');
const Categoria = require('../models/categoriasModel');

// Búsqueda básica de publicaciones
const searchPublicaciones = async (req, res) => {
    try {
        const { q, title, content, category, page = 1, limit = 10, sort = 'fecha', order = 'desc' } = req.query;

        // Convertir a números enteros
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Calcular offset
        const offset = (pageNum - 1) * limitNum;

        let publicaciones = [];
        let totalResults = 0;

        // Construir términos de búsqueda
        const searchTerm = q || '';
        const titleTerm = title || '';
        const contentTerm = content || '';

        // Si se especificó una categoría, primero obtener su ID
        let categoryId = null;
        if (category) {
            // Intentar buscar la categoría por nombre formateado desde el slug
            const categoryName = category
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            const categoriaObj = await Categoria.findByName(categoryName);
            if (categoriaObj) {
                categoryId = categoriaObj.ID_categoria;
            }
        }

        // Realizar la búsqueda
        if (searchTerm || titleTerm || contentTerm || categoryId) {
            const resultados = await Publicacion.search(
                searchTerm,
                titleTerm,
                contentTerm,
                categoryId,
                limitNum,
                offset,
                sort,
                order
            );

            publicaciones = resultados.publicaciones;
            totalResults = resultados.total;
        } else {
            // Si no hay términos de búsqueda, obtener las publicaciones más recientes
            const resultados = await Publicacion.getAll(limitNum, offset, 'publicado');
            publicaciones = resultados.publicaciones;
            totalResults = resultados.total;
        }

        res.status(200).json({
            success: true,
            count: publicaciones.length,
            total: totalResults,
            totalPages: Math.ceil(totalResults / limitNum),
            currentPage: pageNum,
            data: publicaciones
        });
    } catch (error) {
        console.error('Error en la búsqueda:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al realizar la búsqueda'
        });
    }
};

// Búsqueda avanzada de publicaciones
const advancedSearch = async (req, res) => {
    try {
        const {
            keywords,
            categories,
            dateRange,
            author,
            sort = 'fecha',
            order = 'desc',
            page = 1,
            limit = 10
        } = req.body;

        // Convertir a números enteros
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Calcular offset
        const offset = (pageNum - 1) * limitNum;

        // Realizar la búsqueda avanzada
        const resultados = await Publicacion.advancedSearch(
            keywords,
            categories,
            dateRange,
            author,
            limitNum,
            offset,
            sort,
            order
        );

        res.status(200).json({
            success: true,
            count: resultados.publicaciones.length,
            total: resultados.total,
            totalPages: Math.ceil(resultados.total / limitNum),
            currentPage: pageNum,
            data: resultados.publicaciones
        });
    } catch (error) {
        console.error('Error en la búsqueda avanzada:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al realizar la búsqueda avanzada'
        });
    }
};

// Obtener etiquetas populares para autocompletar
const getPopularTags = async (req, res) => {
    try {
        // Esta función dependerá de cómo manejes las etiquetas en tu base de datos
        // Por ahora, podemos devolver una lista fija de etiquetas populares
        const popularTags = [
            'Educación', 'Técnicas', 'Estudio', 'Aprendizaje', 'Digital',
            'Innovación', 'Herramientas', 'Docentes', 'Evaluación', 'Metodología'
        ];

        res.status(200).json({
            success: true,
            data: popularTags
        });
    } catch (error) {
        console.error('Error al obtener etiquetas populares:', error);
        res.status(500).json({
            success: false,
            error: 'Error del servidor al obtener etiquetas populares'
        });
    }
};

module.exports = {
    searchPublicaciones,
    advancedSearch,
    getPopularTags
};