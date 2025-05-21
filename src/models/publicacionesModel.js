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
      // Obtener las publicaciones con sus administradores
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

      const [publicaciones] = await pool.execute(query, params);
      
      // Para cada publicación, obtener sus categorías
      if (publicaciones.length > 0) {
        for (const publicacion of publicaciones) {
          const categorias = await this.getCategorias(publicacion.ID_publicaciones);
          publicacion.categorias = categorias || [];
        }
      }
      
      console.log(`Recuperadas ${publicaciones.length} publicaciones con sus categorías`);
      return publicaciones;
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      throw error;
    }
  }

  // Obtener las últimas publicaciones (versión simplificada)
  static async getLatest(limite = 10) {
    try {
      // Consulta simplificada solo para publicaciones recientes en estado publicado
      // para servir como alternativa cuando falla el método principal
      const query = `
        SELECT p.*, a.Nombre as NombreAdmin 
        FROM Publicaciones p
        JOIN Administrador a ON p.ID_administrador = a.ID_administrador
        WHERE p.Estado = 'publicado'
        ORDER BY p.Fecha_creacion DESC 
        LIMIT ?
      `;

      console.log(`Ejecutando consulta getLatest con límite ${limite}`);
      const [publicaciones] = await pool.execute(query, [limite]);
      
      // Intentamos obtener categorías, pero si falla no interrumpimos
      if (publicaciones.length > 0) {
        for (const publicacion of publicaciones) {
          try {
            const categorias = await this.getCategorias(publicacion.ID_publicaciones);
            publicacion.categorias = categorias || [];
          } catch (err) {
            console.error(`Error al obtener categorías para publicación ${publicacion.ID_publicaciones}:`, err);
            publicacion.categorias = []; // Categorías vacías en caso de error
          }
        }
      }
      
      console.log(`Recuperadas ${publicaciones.length} publicaciones recientes`);
      return publicaciones;
    } catch (error) {
      console.error('Error en getLatest:', error);
      // Si incluso esta consulta falla, devolvemos un array vacío
      return [];
    }
  }

  // Crear una nueva publicación
  static async create(publicacionData) {
    const { titulo, contenido, resumen, estado, id_administrador, Imagen_portada } = publicacionData;

    try {
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        // Insertar publicación
        const [result] = await connection.execute(
          `INSERT INTO Publicaciones 
           (Titulo, Contenido, Resumen, Imagen_portada, Estado, ID_administrador) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [titulo, contenido, resumen, Imagen_portada || null, estado || 'borrador', id_administrador]
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
    const { titulo, contenido, resumen, estado, Imagen_portada } = publicacionData;

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
           SET Titulo = ?, Contenido = ?, Resumen = ?, Imagen_portada = ?, Estado = ? 
           WHERE ID_publicaciones = ?`,
          [titulo, contenido, resumen, Imagen_portada, estado, id]
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
      const [publicaciones] = await pool.query(
        `SELECT p.*, a.Nombre as NombreAdmin 
         FROM Publicaciones p
         JOIN Administrador a ON p.ID_administrador = a.ID_administrador
         WHERE (p.Titulo LIKE ? OR p.Contenido LIKE ? OR p.Resumen LIKE ?) 
           AND p.Estado = 'publicado'
         ORDER BY p.Fecha_creacion DESC
         LIMIT ? OFFSET ?`,
        [`%${term}%`, `%${term}%`, `%${term}%`, limite, offset]
      );
      
      // Para cada publicación, obtener sus categorías
      if (publicaciones.length > 0) {
        for (const publicacion of publicaciones) {
          const categorias = await this.getCategorias(publicacion.ID_publicaciones);
          publicacion.categorias = categorias || [];
        }
      }
      
      console.log(`Recuperadas ${publicaciones.length} publicaciones por búsqueda general con sus categorías`);
      return publicaciones;
    } catch (error) {
      console.error('Error al buscar publicaciones:', error);
      throw error;
    }
  }

  // Buscar publicaciones por título
  static async searchByTitle(term, limite = 10, offset = 0) {
    try {
      const [publicaciones] = await pool.query(
        `SELECT p.*, a.Nombre as NombreAdmin 
       FROM Publicaciones p
       JOIN Administrador a ON p.ID_administrador = a.ID_administrador
       WHERE p.Titulo LIKE ? 
         AND p.Estado = 'publicado'
       ORDER BY p.Fecha_creacion DESC
       LIMIT ? OFFSET ?`,
        [`%${term}%`, limite, offset]
      );
      
      // Para cada publicación, obtener sus categorías
      if (publicaciones.length > 0) {
        for (const publicacion of publicaciones) {
          const categorias = await this.getCategorias(publicacion.ID_publicaciones);
          publicacion.categorias = categorias || [];
        }
      }
      
      console.log(`Recuperadas ${publicaciones.length} publicaciones por título con sus categorías`);
      return publicaciones;
    } catch (error) {
      console.error('Error al buscar publicaciones por título:', error);
      throw error;
    }
  }

  // Buscar publicaciones por contenido
  static async searchByContent(term, limite = 10, offset = 0) {
    try {
      const [publicaciones] = await pool.query(
        `SELECT p.*, a.Nombre as NombreAdmin 
       FROM Publicaciones p
       JOIN Administrador a ON p.ID_administrador = a.ID_administrador
       WHERE p.Contenido LIKE ? 
         AND p.Estado = 'publicado'
       ORDER BY p.Fecha_creacion DESC
       LIMIT ? OFFSET ?`,
        [`%${term}%`, limite, offset]
      );
      
      // Para cada publicación, obtener sus categorías
      if (publicaciones.length > 0) {
        for (const publicacion of publicaciones) {
          const categorias = await this.getCategorias(publicacion.ID_publicaciones);
          publicacion.categorias = categorias || [];
        }
      }
      
      console.log(`Recuperadas ${publicaciones.length} publicaciones por contenido con sus categorías`);
      return publicaciones;
    } catch (error) {
      console.error('Error al buscar publicaciones por contenido:', error);
      throw error;
    }
  }

  // Buscar publicaciones por etiquetas/categorías
  static async searchByTags(categoryIds, limite = 10, offset = 0) {
    try {
      const [publicaciones] = await pool.query(
        `SELECT DISTINCT p.*, a.Nombre as NombreAdmin 
       FROM Publicaciones p
       JOIN Administrador a ON p.ID_administrador = a.ID_administrador
       JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
       WHERE pc.ID_categoria IN (?) 
         AND p.Estado = 'publicado'
       ORDER BY p.Fecha_creacion DESC
       LIMIT ? OFFSET ?`,
        [categoryIds, limite, offset]
      );
      
      // Para cada publicación, obtener sus categorías
      if (publicaciones.length > 0) {
        for (const publicacion of publicaciones) {
          const categorias = await this.getCategorias(publicacion.ID_publicaciones);
          publicacion.categorias = categorias || [];
        }
      }
      
      console.log(`Recuperadas ${publicaciones.length} publicaciones por categoría con sus categorías completas`);
      return publicaciones;
    } catch (error) {
      console.error('Error al buscar publicaciones por etiquetas:', error);
      throw error;
    }
  }

  // Búsqueda avanzada con múltiples criterios
  static async advancedSearch(criteria, limite = 10, offset = 0) {
    try {
      let queryParams = [];
      let conditions = [];

      // Título
      if (criteria.titulo) {
        conditions.push('p.Titulo LIKE ?');
        queryParams.push(`%${criteria.titulo}%`);
      }

      // Contenido
      if (criteria.contenido) {
        conditions.push('p.Contenido LIKE ?');
        queryParams.push(`%${criteria.contenido}%`);
      }

      // Fecha desde
      if (criteria.fechaDesde) {
        conditions.push('p.Fecha_creacion >= ?');
        queryParams.push(criteria.fechaDesde);
      }

      // Fecha hasta
      if (criteria.fechaHasta) {
        conditions.push('p.Fecha_creacion <= ?');
        queryParams.push(criteria.fechaHasta);
      }

      // Estado (si no se especifica, solo publicados)
      if (criteria.estado) {
        conditions.push('p.Estado = ?');
        queryParams.push(criteria.estado);
      } else {
        conditions.push('p.Estado = "publicado"');
      }

      // Ordenamiento
      let orderBy = 'p.Fecha_creacion DESC';
      if (criteria.ordenarPor) {
        switch (criteria.ordenarPor) {
          case 'titulo_asc':
            orderBy = 'p.Titulo ASC';
            break;
          case 'titulo_desc':
            orderBy = 'p.Titulo DESC';
            break;
          case 'fecha_asc':
            orderBy = 'p.Fecha_creacion ASC';
            break;
          case 'fecha_desc':
            orderBy = 'p.Fecha_creacion DESC';
            break;
        }
      }

      // Construir consulta
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

      // Consulta base sin categorías
      let query = `
      SELECT DISTINCT p.*, a.Nombre as NombreAdmin 
      FROM Publicaciones p
      JOIN Administrador a ON p.ID_administrador = a.ID_administrador
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

      // Añadir límite y offset a los parámetros
      queryParams.push(limite, offset);

      // Si hay categorías, construir una consulta diferente con JOIN
      if (criteria.categorias && criteria.categorias.length > 0) {
        query = `
        SELECT DISTINCT p.*, a.Nombre as NombreAdmin 
        FROM Publicaciones p
        JOIN Administrador a ON p.ID_administrador = a.ID_administrador
        JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
        ${whereClause ? whereClause + ' AND' : 'WHERE'} pc.ID_categoria IN (?)
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
      `;

        // Remover el límite y offset para añadirlos después de las categorías
        queryParams.pop();
        queryParams.pop();

        // Añadir categorías y luego límite/offset
        queryParams.push(criteria.categorias, limite, offset);
      }

      const [publicaciones] = await pool.query(query, queryParams);
      
      // Para cada publicación, obtener sus categorías
      if (publicaciones.length > 0) {
        for (const publicacion of publicaciones) {
          const categorias = await this.getCategorias(publicacion.ID_publicaciones);
          publicacion.categorias = categorias || [];
        }
      }
      
      console.log(`Recuperadas ${publicaciones.length} publicaciones por búsqueda avanzada con sus categorías`);
      return publicaciones;
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      throw error;
    }
  }

}

module.exports = Publicacion;