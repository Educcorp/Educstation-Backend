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

  /**
   * Contar resultados de búsqueda simple
   * @param {string} term Término de búsqueda
   * @returns {number} Total de publicaciones que coinciden
   */
  static async countSearchResults(term) {
    try {
      const [result] = await pool.execute(
        `SELECT COUNT(*) as total 
         FROM Publicaciones p
         WHERE (p.Titulo LIKE ? OR p.Contenido LIKE ? OR p.Resumen LIKE ?) 
           AND p.Estado = 'publicado'`,
        [`%${term}%`, `%${term}%`, `%${term}%`]
      );
      return result[0].total;
    } catch (error) {
      console.error('Error al contar resultados de búsqueda:', error);
      throw error;
    }
  }

  /**
   * Búsqueda avanzada con múltiples criterios
   * @param {object} criteria Criterios de búsqueda
   * @returns {Array} Publicaciones que coinciden con los criterios
   */
  static async advancedSearch(criteria) {
    try {
      const {
        term,
        categorias,
        fechaDesde,
        fechaHasta,
        estado,
        orderBy,
        orderDir,
        limit,
        offset
      } = criteria;

      // Construir la consulta base
      let query = `
        SELECT DISTINCT p.*, a.Nombre as NombreAdmin 
        FROM Publicaciones p
        JOIN Administrador a ON p.ID_administrador = a.ID_administrador
      `;

      // Variables para parámetros
      const params = [];

      // Arreglo para almacenar condiciones WHERE
      const whereConditions = [];

      // Filtrar por término de búsqueda
      if (term && term.trim() !== '') {
        whereConditions.push('(p.Titulo LIKE ? OR p.Contenido LIKE ? OR p.Resumen LIKE ?)');
        params.push(`%${term}%`, `%${term}%`, `%${term}%`);
      }

      // Filtrar por categorías
      if (categorias && categorias.length > 0) {
        query += `
          LEFT JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
        `;
        whereConditions.push('pc.ID_categoria IN (?)');
        params.push(categorias);
      }

      // Filtrar por fecha desde
      if (fechaDesde) {
        whereConditions.push('p.Fecha_creacion >= ?');
        params.push(fechaDesde);
      }

      // Filtrar por fecha hasta
      if (fechaHasta) {
        whereConditions.push('p.Fecha_creacion <= ?');
        params.push(fechaHasta);
      }

      // Filtrar por estado
      if (estado) {
        whereConditions.push('p.Estado = ?');
        params.push(estado);
      } else {
        // Por defecto, solo mostrar publicaciones publicadas
        whereConditions.push("p.Estado = 'publicado'");
      }

      // Añadir condiciones WHERE si hay alguna
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }

      // Ordenar resultados
      query += ` ORDER BY p.${orderBy} ${orderDir}`;

      // Limitar resultados
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      // Ejecutar consulta
      const [rows] = await pool.execute(query, params);

      // Para cada publicación, obtener sus categorías
      for (const publicacion of rows) {
        const categorias = await Publicacion.getCategorias(publicacion.ID_publicaciones);
        publicacion.categorias = categorias;
      }

      return rows;
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      throw error;
    }
  }

  /**
   * Contar resultados de búsqueda avanzada
   * @param {object} criteria Criterios de búsqueda
   * @returns {number} Total de publicaciones que coinciden
   */
  static async countAdvancedSearchResults(criteria) {
    try {
      const {
        term,
        categorias,
        fechaDesde,
        fechaHasta,
        estado
      } = criteria;

      // Construir la consulta base
      let query = `
        SELECT COUNT(DISTINCT p.ID_publicaciones) as total 
        FROM Publicaciones p
      `;

      // Variables para parámetros
      const params = [];

      // Arreglo para almacenar condiciones WHERE
      const whereConditions = [];

      // Filtrar por término de búsqueda
      if (term && term.trim() !== '') {
        whereConditions.push('(p.Titulo LIKE ? OR p.Contenido LIKE ? OR p.Resumen LIKE ?)');
        params.push(`%${term}%`, `%${term}%`, `%${term}%`);
      }

      // Filtrar por categorías
      if (categorias && categorias.length > 0) {
        query += `
          LEFT JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
        `;
        whereConditions.push('pc.ID_categoria IN (?)');
        params.push(categorias);
      }

      // Filtrar por fecha desde
      if (fechaDesde) {
        whereConditions.push('p.Fecha_creacion >= ?');
        params.push(fechaDesde);
      }

      // Filtrar por fecha hasta
      if (fechaHasta) {
        whereConditions.push('p.Fecha_creacion <= ?');
        params.push(fechaHasta);
      }

      // Filtrar por estado
      if (estado) {
        whereConditions.push('p.Estado = ?');
        params.push(estado);
      } else {
        // Por defecto, solo contar publicaciones publicadas
        whereConditions.push("p.Estado = 'publicado'");
      }

      // Añadir condiciones WHERE si hay alguna
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }

      // Ejecutar consulta
      const [result] = await pool.execute(query, params);
      return result[0].total;
    } catch (error) {
      console.error('Error al contar resultados de búsqueda avanzada:', error);
      throw error;
    }
  }

  // Añade estos métodos al final de la clase antes del module.exports

  /**
   * Contar total de publicaciones
   * @returns {number} Total de publicaciones
   */
  static async count() {
    try {
      const [result] = await pool.execute('SELECT COUNT(*) as total FROM Publicaciones');
      return result[0].total;
    } catch (error) {
      console.error('Error al contar publicaciones:', error);
      throw error;
    }
  }

  /**
   * Contar publicaciones por estado
   * @param {string} estado Estado de las publicaciones (borrador/publicado/archivado)
   * @returns {number} Total de publicaciones con el estado especificado
   */
  static async countByEstado(estado) {
    try {
      const [result] = await pool.execute(
        'SELECT COUNT(*) as total FROM Publicaciones WHERE Estado = ?',
        [estado]
      );
      return result[0].total;
    } catch (error) {
      console.error('Error al contar publicaciones por estado:', error);
      throw error;
    }
  }

}

module.exports = Publicacion;