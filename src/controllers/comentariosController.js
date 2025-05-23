const Comentario = require('../models/comentariosModel');
const Publicacion = require('../models/publicacionesModel');
const Usuario = require('../models/usuariosModel');
const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

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
    
    // Verificar que tenemos un usuarioId válido
    if (!usuarioId) {
      console.error('Error: No se pudo obtener usuarioId del token');
      return res.status(400).json({ message: 'Token de usuario inválido' });
    }
    
    try {
      // Verificar que la publicación existe
      console.log(`Buscando publicación con ID: ${publicacionId}`);
      const publicacion = await Publicacion.findById(publicacionId);
      
      if (!publicacion) {
        console.log(`Publicación con ID ${publicacionId} no encontrada`);
        return res.status(404).json({ message: 'Publicación no encontrada' });
      }
      
      console.log(`Publicación encontrada: ${publicacion.Titulo}`);
    } catch (error) {
      console.error(`Error al buscar publicación ${publicacionId}:`, error);
      return res.status(500).json({ message: 'Error al verificar la publicación', error: error.message });
    }
    
    try {
      // Obtener información del usuario para el nickname
      console.log(`Buscando usuario con ID: ${usuarioId}`);
      const usuario = await Usuario.findById(usuarioId);
      
      if (!usuario) {
        console.log(`Usuario con ID ${usuarioId} no encontrado. Detalles del token:`, req.user);
        
        // Verificar directamente en auth_user
        console.log('Verificando directamente en auth_user...');
        const [authUserCheck] = await pool.execute(
          'SELECT id, username, email FROM auth_user WHERE id = ?',
          [usuarioId]
        );
        
        if (authUserCheck.length === 0) {
          console.error(`Usuario con ID ${usuarioId} no existe en auth_user`);
          return res.status(404).json({ message: 'Usuario no encontrado en la base de datos' });
        } else {
          console.log('Usuario encontrado en auth_user:', authUserCheck[0]);
          // Usar los datos directamente de auth_user
          const authUser = authUserCheck[0];
          const nickname = authUser.username;
          
          try {
            // Crear el comentario usando los datos de auth_user
            console.log('Intentando crear comentario con datos de auth_user:', {
              publicacionId,
              usuarioId,
              nickname,
              contenidoLength: contenido.length
            });
            
            const comentarioId = await Comentario.create({
              publicacionId,
              usuarioId,
              nickname,
              contenido
            });
            
            console.log(`Comentario creado con ID: ${comentarioId}`);
            
            // Obtener el comentario recién creado para devolverlo
            const nuevoComentario = await Comentario.findById(comentarioId);
            
            if (!nuevoComentario) {
              console.error(`Comentario creado con ID ${comentarioId} pero no se pudo recuperar`);
              return res.status(500).json({ message: 'El comentario se creó pero no se pudo recuperar' });
            }
            
            console.log('Comentario recuperado:', nuevoComentario);
            
            return res.status(201).json({
              message: 'Comentario creado exitosamente',
              comentario: nuevoComentario
            });
          } catch (error) {
            console.error('Error específico al crear comentario en la base de datos:', error);
            return res.status(500).json({ 
              message: 'Error al crear el comentario en la base de datos',
              error: error.message,
              stack: error.stack
            });
          }
        }
      }
      
      console.log('Usuario encontrado:', {
        id: usuario.ID_usuarios,
        nickname: usuario.Nickname || usuario.username,
        email: usuario.email || usuario.Correo_electronico
      });
      
      // Usar el Nickname si existe, de lo contrario usar username
      const nickname = usuario.Nickname || usuario.username;
      
      try {
        // Crear el comentario
        console.log('Intentando crear comentario en la base de datos con datos:', {
          publicacionId,
          usuarioId,
          nickname,
          contenidoLength: contenido.length
        });
        
        const comentarioId = await Comentario.create({
          publicacionId,
          usuarioId,
          nickname,
          contenido
        });
        
        console.log(`Comentario creado con ID: ${comentarioId}`);
        
        // Obtener el comentario recién creado para devolverlo
        const nuevoComentario = await Comentario.findById(comentarioId);
        
        if (!nuevoComentario) {
          console.error(`Comentario creado con ID ${comentarioId} pero no se pudo recuperar`);
          return res.status(500).json({ message: 'El comentario se creó pero no se pudo recuperar' });
        }
        
        console.log('Comentario recuperado:', nuevoComentario);
        
        return res.status(201).json({
          message: 'Comentario creado exitosamente',
          comentario: nuevoComentario
        });
      } catch (error) {
        console.error('Error específico al crear comentario en la base de datos:', error);
        return res.status(500).json({ 
          message: 'Error al crear el comentario en la base de datos',
          error: error.message,
          stack: error.stack
        });
      }
    } catch (error) {
      console.error(`Error al buscar usuario ${usuarioId}:`, error);
      return res.status(500).json({ 
        message: 'Error al verificar el usuario',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error general al crear comentario:', error);
    console.error('Stack trace completo:', error.stack);
    return res.status(500).json({ message: 'Error del servidor', error: error.message });
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