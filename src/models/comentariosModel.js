const { pool } = require('../config/database');

class Comentario {
  // Obtener un comentario por su ID
  static async findById(comentarioId) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.*, u.Nickname 
         FROM Comentarios c
         JOIN Usuarios u ON c.ID_Usuario = u.ID_usuarios
         WHERE c.ID_comentario = ?`,
        [comentarioId]
      );
      
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al obtener comentario por ID:', error);
      throw error;
    }
  }
  
  // Obtener comentarios por ID de publicación
  static async getByPublicacionId(publicacionId) {
    try {
      console.log('Buscando comentarios para publicación ID:', publicacionId);
      const [rows] = await pool.execute(
        `SELECT c.*, u.Nickname as usuarioNombre
         FROM Comentarios c
         LEFT JOIN Usuarios u ON c.ID_Usuario = u.ID_usuarios
         WHERE c.ID_publicacion = ?
         ORDER BY c.Fecha_publicacion DESC`,
        [publicacionId]
      );
      
      console.log(`Se encontraron ${rows.length} comentarios`);
      return rows;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      throw error;
    }
  }

  // Crear un nuevo comentario
  static async create(comentarioData) {
    const { publicacionId, usuarioId, nickname, contenido } = comentarioData;
    
    try {
      console.log('Creando comentario con datos:', {
        publicacionId,
        usuarioId,
        nickname,
        contenido
      });
      
      const [result] = await pool.execute(
        `INSERT INTO Comentarios 
         (ID_publicacion, ID_Usuario, Nickname, Contenido) 
         VALUES (?, ?, ?, ?)`,
        [publicacionId, usuarioId, nickname, contenido]
      );
      
      console.log('Comentario creado con ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Error al crear comentario:', error);
      throw error;
    }
  }

  // Eliminar comentario
  static async delete(comentarioId, usuarioId) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM Comentarios 
         WHERE ID_comentario = ? AND ID_Usuario = ?`,
        [comentarioId, usuarioId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  }

  // Actualizar comentario
  static async update(comentarioId, usuarioId, contenido) {
    try {
      const [result] = await pool.execute(
        `UPDATE Comentarios 
         SET Contenido = ? 
         WHERE ID_comentario = ? AND ID_Usuario = ?`,
        [contenido, comentarioId, usuarioId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  }

  // Verificar si un usuario es propietario de un comentario
  static async isOwner(comentarioId, usuarioId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 1 FROM Comentarios 
         WHERE ID_comentario = ? AND ID_Usuario = ?`,
        [comentarioId, usuarioId]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error al verificar propietario del comentario:', error);
      throw error;
    }
  }
}

module.exports = Comentario; 