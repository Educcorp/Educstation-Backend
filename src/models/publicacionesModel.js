const { pool } = require('../config/database');

class Publicacion {
  // Buscar publicación por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.*, a.Nombre as NombreAdmin 
         FROM Publicaciones p
         JOIN Administrador a ON p.ID_administrador = a.ID_administrador
         WHERE p.ID_publicaciones = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar publicación por ID:', error);
      throw error;
    }
  }

  // Obtener todas las publicaciones
  static async getAll(limite = 10, offset = 0, estado = null) {
    try {
      let query = `
        SELECT p.*, a.Nombre as NombreAdmin 
        FROM Publicaciones p
        JOIN Administrador a ON p.ID_administrador = a.ID_administrador
      `;
      
      const params = [];
      
      if (estado) {
        query += ' WHERE p.Estado = ?';
        params.push(estado);
      }
      
      query += ' ORDER BY p.Fecha_creacion DESC LIMIT ? OFFSET ?';
      params.push(limite, offset);
      
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      throw error;
    }
  }
  
  // Crear una nueva publicación
  static async create(publicacionData) {
    const { titulo, contenido, resumen, estado, id_administrador } = publicacionData;
    
    try {
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Insertar publicación
        const [result] = await connection.execute(
          `INSERT INTO Publicaciones 
           (Titulo, Contenido, Resumen, Estado, ID_administrador) 
           VALUES (?, ?, ?, ?, ?)`,
          [titulo, contenido, resumen, estado || 'borrador', id_administrador]
        );
        
        const publicacionId = result.insertId;
        
        // Asignar categorías si se proporcionan
        if (publicacionData.categorias && publicacionData.categorias.length > 0) {
          const categoriasQuery = 'INSERT INTO Publicaciones_Categorias (ID_publicacion, ID_categoria) VALUES ?';
          const categoriasValues = publicacionData.categorias.map(catId => [publicacionId, catId]);
          
          await connection.query(categoriasQuery, [categoriasValues]);
        }
        
        await connection.commit();
        return publicacionId;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error al crear publicación:', error);
      throw error;
    }
  }
  
  // Actualizar publicación
  static async update(id, publicacionData) {
    const { titulo, contenido, resumen, estado } = publicacionData;
    
    try {
      const connection = await pool.getConnection();
      
      try {
        await connection.beginTransaction();
        
        // Guardar contenido anterior en historial
        const [currentPublicacion] = await connection.execute(
          'SELECT Titulo, Contenido FROM Publicaciones WHERE ID_publicaciones = ?',
          [id]
        );
        
        if (currentPublicacion.length > 0) {
          await connection.execute(
            `INSERT INTO Historial_Publicaciones 
             (ID_publicacion, Nombre_blog, Contenido_anterior) 
             VALUES (?, ?, ?)`,
            [id, currentPublicacion[0].Titulo, currentPublicacion[0].Contenido]
          );
        }
        
        // Actualizar publicación
        const [result] = await connection.execute(
          `UPDATE Publicaciones 
           SET Titulo = ?, Contenido = ?, Resumen = ?, Estado = ? 
           WHERE ID_publicaciones = ?`,
          [titulo, contenido, resumen, estado, id]
        );
        
        // Actualizar categorías si se proporcionan
        if (publicacionData.categorias) {
          // Eliminar categorías actuales
          await connection.execute(
            'DELETE FROM Publicaciones_Categorias WHERE ID_publicacion = ?',
            [id]
          );
          
          // Insertar nuevas categorías
          if (publicacionData.categorias.length > 0) {
            const categoriasQuery = 'INSERT INTO Publicaciones_Categorias (ID_publicacion, ID_categoria) VALUES ?';
            const categoriasValues = publicacionData.categorias.map(catId => [id, catId]);
            
            await connection.query(categoriasQuery, [categoriasValues]);
          }
        }
        
        await connection.commit();
        return result.affectedRows > 0;
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error al actualizar publicación:', error);
      throw error;
    }
  }
  
  // Eliminar publicación
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Publicaciones WHERE ID_publicaciones = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar publicación:', error);
      throw error;
    }
  }
  
  // Obtener categorías de una publicación
  static async getCategorias(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.* 
         FROM Categorias c
         JOIN Publicaciones_Categorias pc ON c.ID_categoria = pc.ID_categoria
         WHERE pc.ID_publicacion = ?`,
        [id]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener categorías de la publicación:', error);
      throw error;
    }
  }
  
  // Obtener comentarios de una publicación
  static async getComentarios(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT c.* 
         FROM Comentarios c
         WHERE c.ID_publicacion = ?
         ORDER BY c.Fecha_publicacion DESC`,
        [id]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener comentarios de la publicación:', error);
      throw error;
    }
  }
  
  // Obtener imágenes de una publicación
  static async getImagenes(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT i.*, pi.Es_destacada, pi.Orden
         FROM Imagenes i
         JOIN Publicaciones_Imagenes pi ON i.ID_imagen = pi.ID_imagen
         WHERE pi.ID_publicacion = ?
         ORDER BY pi.Es_destacada DESC, pi.Orden ASC`,
        [id]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener imágenes de la publicación:', error);
      throw error;
    }
  }
  
  // Buscar publicaciones
  static async search(term, limite = 10, offset = 0) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.*, a.Nombre as NombreAdmin 
         FROM Publicaciones p
         JOIN Administrador a ON p.ID_administrador = a.ID_administrador
         WHERE (p.Titulo LIKE ? OR p.Contenido LIKE ? OR p.Resumen LIKE ?) 
           AND p.Estado = 'publicado'
         ORDER BY p.Fecha_creacion DESC
         LIMIT ? OFFSET ?`,
        [`%${term}%`, `%${term}%`, `%${term}%`, limite, offset]
      );
      return rows;
    } catch (error) {
      console.error('Error al buscar publicaciones:', error);
      throw error;
    }
  }
}

module.exports = Publicacion;