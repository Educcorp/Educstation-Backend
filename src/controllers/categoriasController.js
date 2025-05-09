// src/controllers/categoriasController.js - Versión mejorada

const Categoria = require('../models/categoriasModel');
const { validationResult } = require('express-validator');

// Obtener todas las categorías
const getAllCategorias = async (req, res) => {
  try {
    // Añadir soporte para parámetros de consulta
    const { conConteo = false } = req.query;

    let categorias;
    if (conConteo === 'true') {
      categorias = await Categoria.getAllWithPostCount();
    } else {
      categorias = await Categoria.getAll();
    }

    res.json({
      success: true,
      count: categorias.length,
      data: categorias
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor al obtener las categorías'
    });
  }
};

// Obtener una categoría por ID
const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        detail: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor'
    });
  }
};

// Obtener una categoría por Slug (nueva función)
const getCategoriaBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Convertir el slug a un formato de nombre de categoría
    // Ejemplo: "tecnicas-de-estudio" -> buscar algo como "Técnicas de Estudio"
    const nombreCategoria = slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const categoria = await Categoria.findByName(nombreCategoria);

    if (!categoria) {
      return res.status(404).json({
        success: false,
        detail: 'Categoría no encontrada'
      });
    }

    res.json({
      success: true,
      data: categoria
    });
  } catch (error) {
    console.error('Error al obtener categoría por slug:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor'
    });
  }
};

// Crear una nueva categoría
const createCategoria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;

    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategoria = await Categoria.findByName(nombre);
    if (existingCategoria) {
      return res.status(400).json({
        success: false,
        detail: 'Ya existe una categoría con ese nombre'
      });
    }

    const categoriaId = await Categoria.create({ nombre, descripcion });
    const newCategoria = await Categoria.findById(categoriaId);

    res.status(201).json({
      success: true,
      data: newCategoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor al crear la categoría'
    });
  }
};

// Actualizar una categoría
const updateCategoria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        detail: 'Categoría no encontrada'
      });
    }

    // Verificar si ya existe otra categoría con el mismo nombre
    if (nombre !== categoria.Nombre_categoria) {
      const existingCategoria = await Categoria.findByName(nombre);
      if (existingCategoria) {
        return res.status(400).json({
          success: false,
          detail: 'Ya existe otra categoría con ese nombre'
        });
      }
    }

    const success = await Categoria.update(id, { nombre, descripcion });

    if (success) {
      const updatedCategoria = await Categoria.findById(id);
      res.json({
        success: true,
        data: updatedCategoria
      });
    } else {
      res.status(500).json({
        success: false,
        detail: 'No se pudo actualizar la categoría'
      });
    }
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor al actualizar la categoría'
    });
  }
};

// Eliminar una categoría
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        detail: 'Categoría no encontrada'
      });
    }

    // Verificar si hay publicaciones asociadas a esta categoría
    const publicaciones = await Categoria.getPublicaciones(id);
    if (publicaciones.length > 0) {
      return res.status(400).json({
        success: false,
        detail: 'No se puede eliminar la categoría porque tiene publicaciones asociadas'
      });
    }

    const success = await Categoria.delete(id);

    if (success) {
      res.json({
        success: true,
        detail: 'Categoría eliminada correctamente'
      });
    } else {
      res.status(500).json({
        success: false,
        detail: 'No se pudo eliminar la categoría'
      });
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor al eliminar la categoría'
    });
  }
};

// Obtener publicaciones por categoría
const getPublicacionesByCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Convertir a números enteros
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Calcular offset
    const offset = (pageNum - 1) * limitNum;

    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        detail: 'Categoría no encontrada'
      });
    }

    // Obtener publicaciones paginadas
    const publicaciones = await Categoria.getPublicacionesPaginated(id, limitNum, offset);

    // Obtener el total de publicaciones para esta categoría
    const totalPublicaciones = await Categoria.countPublicaciones(id);

    res.json({
      success: true,
      count: publicaciones.length,
      total: totalPublicaciones,
      totalPages: Math.ceil(totalPublicaciones / limitNum),
      currentPage: pageNum,
      data: publicaciones
    });
  } catch (error) {
    console.error('Error al obtener publicaciones por categoría:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor al obtener las publicaciones'
    });
  }
};

module.exports = {
  getAllCategorias,
  getCategoriaById,
  getCategoriaBySlug,  // Nueva función
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getPublicacionesByCategoria
};