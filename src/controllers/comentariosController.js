const Comentario = require('../models/comentariosModel');
const Publicacion = require('../models/publicacionesModel');
const Usuario = require('../models/usuariosModel');
const { validationResult } = require('express-validator');

// Obtener comentarios de una publicación
const getComentariosByPublicacion = async (req, res) => {
  try {
    const { publicacionId } = req.params;
    
    console.log('Obteniendo comentarios para publicación:', publicacionId);
    
    if (!publicacionId || publicacionId === 'undefined') {
      return res.status(400).json({ message: 'ID de publicación no válido' });
    }
    
    // Verificar que la publicación existe
    const publicacion = await Publicacion.findById(publicacionId);
    if (!publicacion) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }
    
    const comentarios = await Comentario.getByPublicacionId(publicacionId);
    res.json(comentarios);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Crear comentario
const createComentario = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { publicacionId } = req.params;
    const { contenido, nickname } = req.body;
    const usuarioId = req.userId;
    
    console.log('Creando comentario:', { 
      publicacionId, 
      contenido, 
      usuarioId,
      nickname
    });
    
    if (!publicacionId || publicacionId === 'undefined') {
      return res.status(400).json({ message: 'ID de publicación no válido' });
    }
    
    // Verificar que la publicación existe
    const publicacion = await Publicacion.findById(publicacionId);
    if (!publicacion) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }
    
    // Verificar que el usuario existe
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    // Obtener nickname del usuario desde la sesión o desde el modelo de usuario
    const userNickname = nickname || usuario.nickname || 'Usuario';
    
    const comentarioId = await Comentario.create({
      publicacionId,
      usuarioId,
      nickname: userNickname,
      contenido
    });
    
    // Obtener el comentario recién creado para devolverlo en la respuesta
    const nuevoComentario = await Comentario.findById(comentarioId);
    
    res.status(201).json(nuevoComentario);
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

// Eliminar comentario
const deleteComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.userId;
    
    // Verificar si el comentario existe y pertenece al usuario
    const pertenece = await Comentario.belongsToUser(comentarioId, usuarioId);
    if (!pertenece) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
    }
    
    const eliminado = await Comentario.delete(comentarioId, usuarioId);
    
    if (eliminado) {
      res.json({ message: 'Comentario eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Comentario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = {
  getComentariosByPublicacion,
  createComentario,
  deleteComentario
};