const { pool } = require('../config/database');

class Comentario {
  // Obtener un comentario por su ID
  static async findById(comentarioId) {
    try {
      console.log(`Buscando comentario con ID: ${comentarioId}`);
      
      if (!comentarioId) {
        console.error('ID de comentario no proporcionado');
        return null;
      }
      
      // Intentar primero con JOIN a auth_user en lugar de Usuarios
      const [rows] = await pool.execute(
        `SELECT c.*, u.username as Nickname 
         FROM Comentarios c
         LEFT JOIN auth_user u ON c.ID_Usuario = u.id
         WHERE c.ID_comentario = ?`,
        [comentarioId]
      );
      
      if (rows.length > 0) {
        console.log(`Comentario encontrado: ${rows[0].ID_comentario}`);
        return rows[0];
      }
      
      // Si no se encuentra, intentar sin el JOIN
      const [rowsSimple] = await pool.execute(
        `SELECT * FROM Comentarios WHERE ID_comentario = ?`,
        [comentarioId]
      );
      
      if (rowsSimple.length > 0) {
        console.log(`Comentario encontrado (sin JOIN): ${rowsSimple[0].ID_comentario}`);
        return rowsSimple[0];
      }
      
      console.log(`No se encontró comentario con ID: ${comentarioId}`);
      return null;
    } catch (error) {
      console.error(`Error al obtener comentario por ID ${comentarioId}:`, error);
      throw error;
    }
  }
  
  // Obtener comentarios por ID de publicación
  static async getByPublicacionId(publicacionId) {
    try {
      console.log('Buscando comentarios para publicación ID:', publicacionId);
      const [rows] = await pool.execute(
        `SELECT c.*, u.username as usuarioNombre
         FROM Comentarios c
         LEFT JOIN auth_user u ON c.ID_Usuario = u.id
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
        contenido: contenido.substring(0, 30) + (contenido.length > 30 ? '...' : '')
      });
      
      // Verificar que los IDs son números válidos
      const publicacionIdNum = parseInt(publicacionId, 10);
      const usuarioIdNum = parseInt(usuarioId, 10);
      
      if (isNaN(publicacionIdNum)) {
        throw new Error(`ID de publicación inválido: ${publicacionId}`);
      }
      
      if (isNaN(usuarioIdNum)) {
        throw new Error(`ID de usuario inválido: ${usuarioId}`);
      }
      
      console.log('IDs convertidos a números:', {
        publicacionIdNum,
        usuarioIdNum
      });
      
      // Verificar que el usuario existe en auth_user
      const [userExists] = await pool.execute(
        `SELECT id, username FROM auth_user WHERE id = ?`,
        [usuarioIdNum]
      );
      
      if (userExists.length === 0) {
        throw new Error(`Usuario con ID ${usuarioIdNum} no existe en auth_user`);
      }
      
      console.log(`Usuario verificado: ${userExists[0].username} (ID: ${userExists[0].id})`);
      
      // Usar el nickname de auth_user
      const userNickname = userExists[0].username;
      
      // Modificar la consulta para ignorar la restricción de clave foránea con Usuarios
      // y usar directamente el ID de auth_user
      const [result] = await pool.execute(
        `INSERT INTO Comentarios 
         (ID_publicacion, ID_Usuario, Nickname, Contenido) 
         VALUES (?, ?, ?, ?)`,
        [publicacionIdNum, usuarioIdNum, userNickname, contenido]
      );
      
      console.log('Comentario creado con ID:', result.insertId);
      return result.insertId;
    } catch (error) {
      console.error('Error detallado al crear comentario:', error);
      console.error('Stack trace:', error.stack);
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