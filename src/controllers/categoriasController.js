const Categoria = require('../models/categoriasModel');
const { validationResult } = require('express-validator');

/**
 * @desc    Obtener todas las categorías
 * @route   GET /api/categorias
 * @access  Público
 * @returns {Array} Lista de todas las categorías
 */
const getAllCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.getAll();
    res.json({
      status: 'success',
      count: categorias.length,
      data: categorias
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor al obtener las categorías'
    });
  }
};

/**
 * @desc    Obtener una categoría por ID
 * @route   GET /api/categorias/:id
 * @access  Público
 * @param   {string} req.params.id - ID de la categoría
 * @returns {Object} Datos de la categoría solicitada
 */
const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);

    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }

    res.json({
      status: 'success',
      data: categoria
    });
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor al obtener la categoría'
    });
  }
};

/**
 * @desc    Crear una nueva categoría
 * @route   POST /api/categorias
 * @access  Privado - Solo Administradores
 * @param   {string} req.body.nombre - Nombre de la categoría
 * @param   {string} req.body.descripcion - Descripción de la categoría
 * @returns {Object} Datos de la categoría creada
 */
const createCategoria = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { nombre, descripcion } = req.body;

    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategoria = await Categoria.findByName(nombre);
    if (existingCategoria) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    const categoriaId = await Categoria.create({ nombre, descripcion });
    const newCategoria = await Categoria.findById(categoriaId);

    res.status(201).json({
      status: 'success',
      message: 'Categoría creada exitosamente',
      data: newCategoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor al crear la categoría'
    });
  }
};

/**
 * @desc    Actualizar una categoría existente
 * @route   PUT /api/categorias/:id
 * @access  Privado - Solo Administradores
 * @param   {string} req.params.id - ID de la categoría a actualizar
 * @param   {string} req.body.nombre - Nuevo nombre de la categoría
 * @param   {string} req.body.descripcion - Nueva descripción de la categoría
 * @returns {Object} Datos de la categoría actualizada
 */
const updateCategoria = async (req, res) => {
  try {
    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si ya existe otra categoría con el mismo nombre
    if (nombre !== categoria.Nombre_categoria) {
      const existingCategoria = await Categoria.findByName(nombre);
      if (existingCategoria) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe otra categoría con ese nombre'
        });
      }
    }

    const success = await Categoria.update(id, { nombre, descripcion });

    if (success) {
      const updatedCategoria = await Categoria.findById(id);
      res.json({
        status: 'success',
        message: 'Categoría actualizada exitosamente',
        data: updatedCategoria
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'No se pudo actualizar la categoría'
      });
    }
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor al actualizar la categoría'
    });
  }
};

/**
 * @desc    Eliminar una categoría
 * @route   DELETE /api/categorias/:id
 * @access  Privado - Solo Administradores
 * @param   {string} req.params.id - ID de la categoría a eliminar
 * @returns {Object} Mensaje de confirmación
 */
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }

    const success = await Categoria.delete(id);

    if (success) {
      res.json({
        status: 'success',
        message: 'Categoría eliminada correctamente'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'No se pudo eliminar la categoría'
      });
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor al eliminar la categoría'
    });
  }
};

/**
 * @desc    Obtener publicaciones por categoría
 * @route   GET /api/categorias/:id/publicaciones
 * @access  Público
 * @param   {string} req.params.id - ID de la categoría
 * @returns {Array} Lista de publicaciones asociadas a la categoría
 */
const getPublicacionesByCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({
        status: 'error',
        message: 'Categoría no encontrada'
      });
    }

    const publicaciones = await Categoria.getPublicaciones(id);
    res.json({
      status: 'success',
      categoria: categoria.Nombre_categoria,
      count: publicaciones.length,
      data: publicaciones
    });
  } catch (error) {
    console.error('Error al obtener publicaciones por categoría:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error en el servidor al obtener las publicaciones'
    });
  }
};

module.exports = {
  getAllCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getPublicacionesByCategoria
};