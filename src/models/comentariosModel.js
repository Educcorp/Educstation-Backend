const { pool } = require('../config/database');

class Comentario {
  // Obtener comentarios por ID de publicación
  static async getByPublicacionId(publicacionId) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.*, u.Nickname 
         FROM Comentarios c
         JOIN Usuarios u ON c.ID_Usuario = u.ID_usuarios
         WHERE c.ID_publicacion = ?
         ORDER BY c.Fecha_publicacion DESC`,
        [publicacionId]
      );
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
      const [result] = await pool.execute(
        `INSERT INTO Comentarios 
         (ID_publicacion, ID_Usuario, Nickname, Contenido) 
         VALUES (?, ?, ?, ?)`,
        [publicacionId, usuarioId, nickname, contenido]
      );
      
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

  // Verificar si un comentario pertenece a un usuario
  static async belongsToUser(comentarioId, usuarioId) {
    try {
      const [rows] = await pool.execute(
        `SELECT 1 FROM Comentarios 
         WHERE ID_comentario = ? AND ID_Usuario = ?`,
        [comentarioId, usuarioId]
      );
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error al verificar propiedad del comentario:', error);
      throw error;
    }
  }
}

module.exports = Comentario;