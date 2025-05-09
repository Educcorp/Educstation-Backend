// src/controllers/categoriasController.js - Versión corregida

const Categoria = require('../models/categoriasModel');
const { validationResult } = require('express-validator');

// Obtener todas las categorías
const getAllCategorias = async (req, res) => {
  try {
    // Parámetros de paginación
    const limite = req.query.limite ? parseInt(req.query.limite) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset) : 0;
    const { conConteo = false } = req.query;

    // Validar parámetros
    if (limite && (isNaN(limite) || limite < 1)) {
      return res.status(400).json({
        success: false,
        detail: 'El límite debe ser un número positivo'
      });
    }
    if (offset && (isNaN(offset) || offset < 0)) {
      return res.status(400).json({
        success: false,
        detail: 'El offset debe ser un número no negativo'
      });
    }

    // Obtener categorías según parámetros
    let categorias;
    if (conConteo === 'true') {
      categorias = await Categoria.getAllWithPostCount();
    } else {
      categorias = await Categoria.getAll();
    }

    // Obtener total para paginación
    const total = await Categoria.getTotal();

    res.json({
      success: true,
      count: categorias.length,
      total: total,
      data: categorias,
      meta: {
        limite,
        offset
      }
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

// Añadir estos nuevos métodos al controlador existente

/**
 * @api {get} /api/categorias/stats Obtener estadísticas de categorías
 * @apiName GetCategoriasStats
 * @apiGroup Categorias
 * @apiSuccess {Object[]} stats Estadísticas de publicaciones por categoría
 */
const getCategoriasStats = async (req, res) => {
  try {
    // Usamos getAllWithPostCount ya que tiene la información que necesitamos
    const stats = await Categoria.getAllWithPostCount();

    res.json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de categorías:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor'
    });
  }
};

/**
 * @api {get} /api/categorias/search Buscar categorías
 * @apiName SearchCategorias
 * @apiGroup Categorias
 * @apiParam {String} term Término de búsqueda
 * @apiParam {String} [orderBy=Nombre_categoria] Campo para ordenar resultados
 * @apiParam {String} [orderDir=asc] Dirección de ordenamiento (asc/desc)
 * @apiParam {Number} [page=1] Página actual
 * @apiParam {Number} [limit=10] Cantidad de resultados por página
 * @apiSuccess {Object[]} categorias Categorías encontradas
 */
const searchCategorias = async (req, res) => {
  try {
    const { term, orderBy = 'Nombre_categoria', orderDir = 'ASC', page = 1, limit = 10 } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        detail: 'Se requiere un término de búsqueda'
      });
    }

    // Convertir a números
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Calcular offset
    const offset = (pageNum - 1) * limitNum;

    // Validar campos de ordenamiento
    const validOrderFields = ['Nombre_categoria', 'ID_categoria'];
    const cleanOrderBy = validOrderFields.includes(orderBy) ? orderBy : 'Nombre_categoria';

    // Validar dirección
    const cleanOrderDir = ['ASC', 'DESC'].includes(orderDir.toUpperCase()) ?
      orderDir.toUpperCase() : 'ASC';

    // Buscar categorías
    const categorias = await Categoria.search(term, cleanOrderBy, cleanOrderDir, limitNum, offset);

    // Contar total de resultados
    const totalResults = await Categoria.countSearchResults(term);

    res.json({
      success: true,
      count: categorias.length,
      total: totalResults,
      totalPages: Math.ceil(totalResults / limitNum),
      currentPage: pageNum,
      data: categorias
    });
  } catch (error) {
    console.error('Error al buscar categorías:', error);
    res.status(500).json({
      success: false,
      detail: 'Error en el servidor'
    });
  }
};

module.exports = {
  getAllCategorias,
  getCategoriaById,
  getCategoriaBySlug,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getPublicacionesByCategoria,
  getCategoriasStats,
  searchCategorias
};