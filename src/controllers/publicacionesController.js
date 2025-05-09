const Publicacion = require('../models/publicacionesModel');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Obtener todas las publicaciones
const getAllPublicaciones = async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const estado = req.query.estado || null;
    
    const publicaciones = await Publicacion.getAll(limite, offset, estado);
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Obtener publicación por ID
const getPublicacionById = async (req, res) => {
  try {
    const { id } = req.params;
    const publicacion = await Publicacion.findById(id);
    
    if (!publicacion) {
      return res.status(404).json({ detail: 'Publicación no encontrada' });
    }
    
    // Obtener categorías e imágenes asociadas
    const categorias = await Publicacion.getCategorias(id);
    const imagenes = await Publicacion.getImagenes(id);
    
    res.json({
      ...publicacion,
      categorias,
      imagenes
    });
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Crear una nueva publicación
const createPublicacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { titulo, contenido, resumen, estado, categorias } = req.body;
    
    // Obtener ID del administrador del token (asumiendo que está disponible en req.user)
    const id_administrador = req.user.id;
    
    const publicacionData = {
      titulo,
      contenido,
      resumen,
      estado,
      id_administrador,
      categorias
    };
    
    const publicacionId = await Publicacion.create(publicacionData);
    
    res.status(201).json({
      id: publicacionId,
      message: 'Publicación creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Crear una publicación a partir de un archivo HTML
const createPublicacionFromHTML = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    if (!req.body.htmlContent) {
      return res.status(400).json({ detail: 'El contenido HTML es requerido' });
    }
    
    const { titulo, resumen, estado, categorias, htmlContent } = req.body;
    
    // Obtener ID del administrador del token
    const id_administrador = req.user.id;
    
    const publicacionData = {
      titulo,
      contenido: htmlContent, // El contenido es directamente el HTML
      resumen,
      estado,
      id_administrador,
      categorias
    };
    
    const publicacionId = await Publicacion.create(publicacionData);
    
    res.status(201).json({
      id: publicacionId,
      message: 'Publicación creada exitosamente a partir del HTML'
    });
  } catch (error) {
    console.error('Error al crear publicación desde HTML:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Actualizar una publicación existente
const updatePublicacion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { titulo, contenido, resumen, estado, categorias } = req.body;
    
    // Verificar que la publicación existe
    const publicacion = await Publicacion.findById(id);
    if (!publicacion) {
      return res.status(404).json({ detail: 'Publicación no encontrada' });
    }
    
    // Verificar que el usuario es el dueño de la publicación (opcional)
    // if (publicacion.ID_administrador !== req.user.id) {
    //   return res.status(403).json({ detail: 'No autorizado para modificar esta publicación' });
    // }
    
    const publicacionData = {
      titulo,
      contenido,
      resumen,
      estado,
      categorias
    };
    
    const updated = await Publicacion.update(id, publicacionData);
    
    if (updated) {
      res.json({ message: 'Publicación actualizada exitosamente' });
    } else {
      res.status(400).json({ detail: 'No se pudo actualizar la publicación' });
    }
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Eliminar una publicación
const deletePublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la publicación existe
    const publicacion = await Publicacion.findById(id);
    if (!publicacion) {
      return res.status(404).json({ detail: 'Publicación no encontrada' });
    }
    
    // Verificar que el usuario es el dueño de la publicación (opcional)
    // if (publicacion.ID_administrador !== req.user.id) {
    //   return res.status(403).json({ detail: 'No autorizado para eliminar esta publicación' });
    // }
    
    const deleted = await Publicacion.delete(id);
    
    if (deleted) {
      res.json({ message: 'Publicación eliminada exitosamente' });
    } else {
      res.status(400).json({ detail: 'No se pudo eliminar la publicación' });
    }
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Buscar publicaciones
const searchPublicaciones = async (req, res) => {
  try {
    const { term } = req.query;
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    
    if (!term) {
      return res.status(400).json({ detail: 'Término de búsqueda requerido' });
    }
    
    const results = await Publicacion.search(term, limite, offset);
    res.json(results);
  } catch (error) {
    console.error('Error al buscar publicaciones:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

module.exports = {
  getAllPublicaciones,
  getPublicacionById,
  createPublicacion,
  createPublicacionFromHTML,
  updatePublicacion,
  deletePublicacion,
  searchPublicaciones
}; 