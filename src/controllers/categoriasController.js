const Categoria = require('../models/categoriasModel');
const { validationResult } = require('express-validator');

// Obtener todas las categorías
const getAllCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.getAll();
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Obtener una categoría por ID
const getCategoriaById = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findById(id);
    
    if (!categoria) {
      return res.status(404).json({ detail: 'Categoría no encontrada' });
    }
    
    res.json(categoria);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Crear una nueva categoría
const createCategoria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { nombre, descripcion } = req.body;
    
    // Verificar si ya existe una categoría con el mismo nombre
    const existingCategoria = await Categoria.findByName(nombre);
    if (existingCategoria) {
      return res.status(400).json({ detail: 'Ya existe una categoría con ese nombre' });
    }
    
    const categoriaId = await Categoria.create({ nombre, descripcion });
    const newCategoria = await Categoria.findById(categoriaId);
    
    res.status(201).json(newCategoria);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Actualizar una categoría
const updateCategoria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    
    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ detail: 'Categoría no encontrada' });
    }
    
    // Verificar si ya existe otra categoría con el mismo nombre
    if (nombre !== categoria.Nombre_categoria) {
      const existingCategoria = await Categoria.findByName(nombre);
      if (existingCategoria) {
        return res.status(400).json({ detail: 'Ya existe otra categoría con ese nombre' });
      }
    }
    
    const success = await Categoria.update(id, { nombre, descripcion });
    
    if (success) {
      const updatedCategoria = await Categoria.findById(id);
      res.json(updatedCategoria);
    } else {
      res.status(500).json({ detail: 'No se pudo actualizar la categoría' });
    }
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Eliminar una categoría
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ detail: 'Categoría no encontrada' });
    }
    
    const success = await Categoria.delete(id);
    
    if (success) {
      res.json({ detail: 'Categoría eliminada correctamente' });
    } else {
      res.status(500).json({ detail: 'No se pudo eliminar la categoría' });
    }
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Obtener publicaciones por categoría
const getPublicacionesByCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si existe la categoría
    const categoria = await Categoria.findById(id);
    if (!categoria) {
      return res.status(404).json({ detail: 'Categoría no encontrada' });
    }
    
    const publicaciones = await Categoria.getPublicaciones(id);
    res.json(publicaciones);
  } catch (error) {
    console.error('Error al obtener publicaciones por categoría:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
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