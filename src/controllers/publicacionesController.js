const Publicacion = require('../models/publicacionesModel');
const { validationResult } = require('express-validator');

/**
 * @desc    Obtener todas las publicaciones con paginación
 * @route   GET /api/publicaciones
 * @access  Público
 */
const getAllPublicaciones = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado } = req.query;
        const offset = (page - 1) * limit;

        const publicaciones = await Publicacion.getAll(parseInt(limit), parseInt(offset), estado);

        // Obtener el total de publicaciones para la paginación
        let totalPublicaciones;
        if (estado) {
            totalPublicaciones = await Publicacion.countByEstado(estado);
        } else {
            totalPublicaciones = await Publicacion.count();
        }

        res.json({
            status: 'success',
            total: totalPublicaciones,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalPublicaciones / limit),
            data: publicaciones
        });
    } catch (error) {
        console.error('Error al obtener publicaciones:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al obtener las publicaciones'
        });
    }
};

/**
 * @desc    Obtener una publicación por ID
 * @route   GET /api/publicaciones/:id
 * @access  Público
 */
const getPublicacionById = async (req, res) => {
    try {
        const { id } = req.params;
        const publicacion = await Publicacion.findById(id);

        if (!publicacion) {
            return res.status(404).json({
                status: 'error',
                message: 'Publicación no encontrada'
            });
        }

        // Obtener categorías asociadas
        const categorias = await Publicacion.getCategorias(id);

        // Obtener imágenes asociadas
        const imagenes = await Publicacion.getImagenes(id);

        // Combinar datos para la respuesta
        const result = {
            ...publicacion,
            categorias,
            imagenes
        };

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Error al obtener publicación:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al obtener la publicación'
        });
    }
};

/**
 * @desc    Crear una nueva publicación
 * @route   POST /api/publicaciones
 * @access  Privado - Solo Administradores
 */
const createPublicacion = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { titulo, contenido, resumen, estado, categorias } = req.body;

        // El ID del administrador viene del token de autenticación
        const id_administrador = req.userId;

        const publicacionId = await Publicacion.create({
            titulo,
            contenido,
            resumen,
            estado,
            id_administrador,
            categorias
        });

        const newPublicacion = await Publicacion.findById(publicacionId);

        res.status(201).json({
            status: 'success',
            message: 'Publicación creada exitosamente',
            data: newPublicacion
        });
    } catch (error) {
        console.error('Error al crear publicación:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al crear la publicación'
        });
    }
};

/**
 * @desc    Actualizar una publicación existente
 * @route   PUT /api/publicaciones/:id
 * @access  Privado - Solo Administradores
 */
const updatePublicacion = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: 'error',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { titulo, contenido, resumen, estado, categorias } = req.body;

        // Verificar si existe la publicación
        const publicacion = await Publicacion.findById(id);
        if (!publicacion) {
            return res.status(404).json({
                status: 'error',
                message: 'Publicación no encontrada'
            });
        }

        const success = await Publicacion.update(id, {
            titulo,
            contenido,
            resumen,
            estado,
            categorias
        });

        if (success) {
            const updatedPublicacion = await Publicacion.findById(id);

            // Obtener categorías asociadas
            const categorias = await Publicacion.getCategorias(id);

            // Obtener imágenes asociadas
            const imagenes = await Publicacion.getImagenes(id);

            // Combinar datos para la respuesta
            const result = {
                ...updatedPublicacion,
                categorias,
                imagenes
            };

            res.json({
                status: 'success',
                message: 'Publicación actualizada exitosamente',
                data: result
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'No se pudo actualizar la publicación'
            });
        }
    } catch (error) {
        console.error('Error al actualizar publicación:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al actualizar la publicación'
        });
    }
};

/**
 * @desc    Eliminar una publicación
 * @route   DELETE /api/publicaciones/:id
 * @access  Privado - Solo Administradores
 */
const deletePublicacion = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si existe la publicación
        const publicacion = await Publicacion.findById(id);
        if (!publicacion) {
            return res.status(404).json({
                status: 'error',
                message: 'Publicación no encontrada'
            });
        }

        const success = await Publicacion.delete(id);

        if (success) {
            res.json({
                status: 'success',
                message: 'Publicación eliminada correctamente'
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: 'No se pudo eliminar la publicación'
            });
        }
    } catch (error) {
        console.error('Error al eliminar publicación:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al eliminar la publicación'
        });
    }
};

/**
 * @desc    Obtener los comentarios de una publicación
 * @route   GET /api/publicaciones/:id/comentarios
 * @access  Público
 */
const getComentarios = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si existe la publicación
        const publicacion = await Publicacion.findById(id);
        if (!publicacion) {
            return res.status(404).json({
                status: 'error',
                message: 'Publicación no encontrada'
            });
        }

        const comentarios = await Publicacion.getComentarios(id);

        res.json({
            status: 'success',
            data: comentarios
        });
    } catch (error) {
        console.error('Error al obtener comentarios:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error en el servidor al obtener los comentarios'
        });
    }
};

module.exports = {
    getAllPublicaciones,
    getPublicacionById,
    createPublicacion,
    updatePublicacion,
    deletePublicacion,
    getComentarios
};