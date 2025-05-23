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

// Crear un nuevo comentario
const createComentario = async (req, res) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { publicacionId } = req.params;
    const { contenido } = req.body;
    
    // Log completo del objeto req.user para depuración
    console.log('Objeto req.user completo:', JSON.stringify(req.user));
    
    // Usar userId en lugar de id (corregido)
    const usuarioId = req.user.userId; 
    
    console.log('Datos para crear comentario:', {
      publicacionId,
      usuarioId,
      tokenInfo: {
        userId: req.user.userId,
        iat: req.user.iat,
        exp: req.user.exp
      },
      contenido: contenido.substring(0, 30) + (contenido.length > 30 ? '...' : '')
    });
    
    // Verificar que la publicación existe
    const publicacion = await Publicacion.findById(publicacionId);
    if (!publicacion) {
      console.log(`Publicación con ID ${publicacionId} no encontrada`);
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }
    
    console.log(`Publicación encontrada: ${publicacion.Titulo}`);
    
    // Obtener información del usuario para el nickname
    console.log(`Buscando usuario con ID: ${usuarioId}`);
    const usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      console.log(`Usuario con ID ${usuarioId} no encontrado. Detalles del token:`, req.user);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    console.log('Usuario encontrado:', {
      id: usuario.ID_usuarios,
      nickname: usuario.Nickname || usuario.username,
      email: usuario.email || usuario.Correo_electronico
    });
    
    // Usar el Nickname si existe, de lo contrario usar username
    const nickname = usuario.Nickname || usuario.username;
    
    // Crear el comentario
    const comentarioId = await Comentario.create({
      publicacionId,
      usuarioId,
      nickname,
      contenido
    });
    
    console.log(`Comentario creado con ID: ${comentarioId}`);
    
    // Obtener el comentario recién creado para devolverlo
    const nuevoComentario = await Comentario.findById(comentarioId);
    
    res.status(201).json({
      message: 'Comentario creado exitosamente',
      comentario: nuevoComentario
    });
  } catch (error) {
    console.error('Error detallado al crear comentario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Actualizar un comentario
const updateComentario = async (req, res) => {
  try {
    // Validar datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { comentarioId } = req.params;
    const { contenido } = req.body;
    const usuarioId = req.user.userId; // Corregido: usar userId en lugar de id
    
    console.log('Actualizando comentario:', {
      comentarioId,
      usuarioId,
      contenido: contenido.substring(0, 30) + '...' // Log parcial del contenido
    });
    
    // Verificar que el comentario existe
    const comentario = await Comentario.findById(comentarioId);
    if (!comentario) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    
    // Verificar que el usuario es el propietario del comentario
    const isOwner = await Comentario.isOwner(comentarioId, usuarioId);
    if (!isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para editar este comentario' });
    }
    
    // Actualizar el comentario
    const actualizado = await Comentario.update(comentarioId, usuarioId, contenido);
    
    if (actualizado) {
      const comentarioActualizado = await Comentario.findById(comentarioId);
      res.json({
        message: 'Comentario actualizado exitosamente',
        comentario: comentarioActualizado
      });
    } else {
      res.status(500).json({ message: 'Error al actualizar el comentario' });
    }
  } catch (error) {
    console.error('Error al actualizar comentario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Eliminar un comentario
const deleteComentario = async (req, res) => {
  try {
    const { comentarioId } = req.params;
    const usuarioId = req.user.userId; // Corregido: usar userId en lugar de id
    
    console.log('Eliminando comentario:', {
      comentarioId,
      usuarioId
    });
    
    // Verificar que el comentario existe
    const comentario = await Comentario.findById(comentarioId);
    if (!comentario) {
      return res.status(404).json({ message: 'Comentario no encontrado' });
    }
    
    // Verificar que el usuario es el propietario del comentario
    const isOwner = await Comentario.isOwner(comentarioId, usuarioId);
    if (!isOwner) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este comentario' });
    }
    
    // Eliminar el comentario
    const eliminado = await Comentario.delete(comentarioId, usuarioId);
    
    if (eliminado) {
      res.json({ message: 'Comentario eliminado exitosamente' });
    } else {
      res.status(500).json({ message: 'Error al eliminar el comentario' });
    }
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = {
  getComentariosByPublicacion,
  createComentario,
  updateComentario,
  deleteComentario
}; 