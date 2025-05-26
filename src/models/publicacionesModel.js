const { pool } = require('../config/database');

class Publicacion {
  // Utility method to process Imagen_portada data
  static processImagenPortada(publicacion) {
    if (!publicacion || !publicacion.Imagen_portada) return;
      
    // If it's a Buffer, convert to string
    if (publicacion.Imagen_portada instanceof Buffer) {
      try {
        const imgString = publicacion.Imagen_portada.toString('utf8');
        if (imgString.startsWith('data:image')) {
          publicacion.Imagen_portada = imgString;
        } else {
          // If not a valid base64 image, set to null
          console.log(`Publication ${publicacion.ID_publicaciones} has invalid Imagen_portada data, converting to null`);
          publicacion.Imagen_portada = null;
        }
      } catch (error) {
        console.error(`Error converting Buffer to string for publication ${publicacion.ID_publicaciones}:`, error);
        publicacion.Imagen_portada = null;
      }
    } else if (typeof publicacion.Imagen_portada !== 'string' || publicacion.Imagen_portada === '[object Object]') {
      // Handle non-string data that's not a buffer
      console.log(`Publication ${publicacion.ID_publicaciones} has non-string Imagen_portada: ${typeof publicacion.Imagen_portada}`);
      publicacion.Imagen_portada = null;
    }
  }

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
      
      // Process the post if found
      if (rows.length > 0) {
        const post = rows[0];
        this.processImagenPortada(post);
        return post;
      }
      
      return null;
    } catch (error) {
      console.error('Error al buscar publicación por ID:', error);
      throw error;
    }
  }

  // Obtener todas las publicaciones (OPTIMIZADO)
  static async getAll(limite = 10, offset = 0, estado = null) {
    try {
      const limitNum = parseInt(limite, 10) || 10;
      const offsetNum = parseInt(offset, 10) || 0;

      // OPTIMIZACIÓN: Una sola consulta con JOINs para obtener todo
      let query = `
        SELECT 
          p.*,
          a.Nombre as NombreAdmin,
          GROUP_CONCAT(
            CONCAT(c.ID_categoria, ':', c.Nombre_categoria) 
            SEPARATOR '|'
          ) as categorias_concat
        FROM Publicaciones p
        LEFT JOIN Administrador a ON p.ID_administrador = a.ID_administrador
        LEFT JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
        LEFT JOIN Categorias c ON pc.ID_categoria = c.ID_categoria
      `;

      if (estado && typeof estado === 'string' && estado.trim() !== '') {
        query += ` WHERE p.Estado = '${estado}'`;
      }

      query += ` 
        GROUP BY p.ID_publicaciones
        ORDER BY p.Fecha_creacion DESC 
        LIMIT ${limitNum} OFFSET ${offsetNum}
      `;

      console.log('📊 Ejecutando consulta optimizada getAll');

      const [publicaciones] = await pool.query(query);
      
      // Procesar datos en lote
      const processedPublicaciones = publicaciones.map(publicacion => {
        // Procesar imagen de portada
        this.processImagenPortada(publicacion);
        
        // Procesar categorías desde el GROUP_CONCAT
        publicacion.categorias = [];
        if (publicacion.categorias_concat) {
          publicacion.categorias = publicacion.categorias_concat
            .split('|')
            .filter(cat => cat && cat.includes(':'))
            .map(cat => {
              const [ID_categoria, Nombre_categoria] = cat.split(':');
              return { ID_categoria: parseInt(ID_categoria), Nombre_categoria };
            });
        }
        
        // Limpiar campo temporal
        delete publicacion.categorias_concat;
        
        return publicacion;
      });
      
      console.log(`✅ Recuperadas ${processedPublicaciones.length} publicaciones optimizadas`);
      return processedPublicaciones;
    } catch (error) {
      console.error('❌ Error al obtener publicaciones:', error);
      throw error;
    }
  }

  // Obtener las últimas publicaciones (OPTIMIZADO)
  static async getLatest(limite = 10) {
    try {
      const limitNum = parseInt(limite, 10) || 10;
      
      // Consulta optimizada con una sola query
      const query = `
        SELECT 
          p.*,
          a.Nombre as NombreAdmin,
          GROUP_CONCAT(
            CONCAT(c.ID_categoria, ':', c.Nombre_categoria) 
            SEPARATOR '|'
          ) as categorias_concat
        FROM Publicaciones p
        LEFT JOIN Administrador a ON p.ID_administrador = a.ID_administrador
        LEFT JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
        LEFT JOIN Categorias c ON pc.ID_categoria = c.ID_categoria
        WHERE p.Estado = 'publicado'
        GROUP BY p.ID_publicaciones
        ORDER BY p.Fecha_creacion DESC 
        LIMIT ${limitNum}
      `;

      console.log(`🚀 Ejecutando consulta optimizada getLatest (${limitNum} posts)`);
      const [publicaciones] = await pool.query(query);
      
      // Procesamiento optimizado en lote
      const processedPublicaciones = publicaciones.map(publicacion => {
        // Procesar imagen de portada
        this.processImagenPortada(publicacion);
        
        // Procesar categorías desde GROUP_CONCAT
        publicacion.categorias = [];
        if (publicacion.categorias_concat) {
          publicacion.categorias = publicacion.categorias_concat
            .split('|')
            .filter(cat => cat && cat.includes(':'))
            .map(cat => {
              const [ID_categoria, Nombre_categoria] = cat.split(':');
              return { ID_categoria: parseInt(ID_categoria), Nombre_categoria };
            });
        }
        
        // Limpiar campo temporal
        delete publicacion.categorias_concat;
        
        return publicacion;
      });
      
      console.log(`⚡ Recuperadas ${processedPublicaciones.length} publicaciones recientes optimizadas`);
      return processedPublicaciones;
    } catch (error) {
      console.error('❌ Error en getLatest optimizado:', error);
      // Fallback a método simple si falla
      try {
        console.log('🔄 Intentando método fallback...');
        const fallbackQuery = `
          SELECT p.*, a.Nombre as NombreAdmin 
          FROM Publicaciones p
          LEFT JOIN Administrador a ON p.ID_administrador = a.ID_administrador
          WHERE p.Estado = 'publicado'
          ORDER BY p.Fecha_creacion DESC 
          LIMIT ${limitNum}
        `;
        
        const [fallbackPublicaciones] = await pool.query(fallbackQuery);
        
        // Procesar solo imágenes para el fallback
        fallbackPublicaciones.forEach(publicacion => {
          this.processImagenPortada(publicacion);
          publicacion.categorias = []; // Sin categorías en fallback
        });
        
        console.log(`🆘 Fallback completado: ${fallbackPublicaciones.length} posts`);
        return fallbackPublicaciones;
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError);
        return [];
      }
    }
  }

  // Crear una nueva publicación
  static async create(publicacionData) {
    const { titulo, contenido, resumen, estado, id_administrador, Imagen_portada } = publicacionData;

    // Process Imagen_portada to ensure it's a string
    let imagenPortadaProcessed = null;
    if (Imagen_portada) {
      // Check if it's already a string
      if (typeof Imagen_portada === 'string') {
        imagenPortadaProcessed = Imagen_portada;
      } else {
        // Try to convert to string if it's an object
        try {
          console.log('Converting Imagen_portada object to string');
          // If toString() doesn't yield a base64 string, return null
          const strValue = Imagen_portada.toString();
          imagenPortadaProcessed = strValue.startsWith('data:image') ? strValue : null;
        } catch (err) {
          console.error('Error processing Imagen_portada:', err);
          imagenPortadaProcessed = null;
        }
      }
    }

    try {
      const connection = await pool.getConnection();

      try {
        await connection.beginTransaction();

        // Insertar publicación
        const [result] = await connection.execute(
          `INSERT INTO Publicaciones 
           (Titulo, Contenido, Resumen, Imagen_portada, Estado, ID_administrador) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [titulo, contenido, resumen, imagenPortadaProcessed, estado || 'borrador', id_administrador]
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

    // Process Imagen_portada to ensure it's a string
    let imagenPortadaProcessed = null;
    if (Imagen_portada) {
      // Check if it's already a string
      if (typeof Imagen_portada === 'string') {
        imagenPortadaProcessed = Imagen_portada;
      } else {
        // Try to convert to string if it's an object
        try {
          console.log('Converting Imagen_portada object to string');
          // If toString() doesn't yield a base64 string, return null
          const strValue = Imagen_portada.toString();
          imagenPortadaProcessed = strValue.startsWith('data:image') ? strValue : null;
        } catch (err) {
          console.error('Error processing Imagen_portada:', err);
          imagenPortadaProcessed = null;
        }
      }
    }

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
          [titulo, contenido, resumen, imagenPortadaProcessed, estado, id]
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
      
      // Process Imagen_portada for each publication
      for (const publicacion of publicaciones) {
        this.processImagenPortada(publicacion);
      }
      
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
      
      // Process Imagen_portada for each publication
      for (const publicacion of publicaciones) {
        this.processImagenPortada(publicacion);
      }
      
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
      
      // Process Imagen_portada for each publication
      for (const publicacion of publicaciones) {
        this.processImagenPortada(publicacion);
      }
      
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
      
      // Process Imagen_portada for each publication
      for (const publicacion of publicaciones) {
        this.processImagenPortada(publicacion);
      }
      
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

  static async getByUserId(userId, limite = 10, offset = 0) {
    try {
      const limitNum = parseInt(limite, 10) || 10;
      const offsetNum = parseInt(offset, 10) || 0;
      const [publicaciones] = await pool.execute(
        `SELECT * FROM Publicaciones WHERE ID_administrador = ? ORDER BY Fecha_creacion DESC LIMIT ? OFFSET ?`,
        [userId, limitNum, offsetNum]
      );
      return publicaciones;
    } catch (error) {
      return [{ error: error.message }];
    }
  }

  // Obtener publicaciones por ID de administrador
  static async getByAdminId(adminId, limite = 10, offset = 0) {
    try {
      console.log(`Buscando publicaciones para administrador ID: ${adminId}`);
      
      if (!adminId) {
        console.error('Error: adminId es undefined o null');
        return [];
      }
      
      // Convertir a enteros para asegurar que son números válidos
      const limitNum = parseInt(limite, 10) || 10;
      const offsetNum = parseInt(offset, 10) || 0;
      
      const query = `
        SELECT p.*, a.Nombre as NombreAdmin,
        COALESCE(p.Fecha_modificacion, p.Fecha_creacion) as FechaOrdenamiento
        FROM Publicaciones p
        LEFT JOIN Administrador a ON p.ID_administrador = a.ID_administrador
        WHERE p.ID_administrador = ?
        ORDER BY FechaOrdenamiento DESC
        LIMIT ? OFFSET ?
      `;
      
      console.log(`Ejecutando consulta con adminId=${adminId}, limite=${limitNum}, offset=${offsetNum}`);
      const [publicaciones] = await pool.execute(query, [adminId, limitNum, offsetNum]);
      
      console.log(`Consulta ejecutada, encontradas ${publicaciones.length} publicaciones`);
      
      // Normalizar datos de las publicaciones
      for (const publicacion of publicaciones) {
        this.processImagenPortada(publicacion);
      }
      
      // Para cada publicación, obtener sus categorías
      if (publicaciones.length > 0) {
        for (const publicacion of publicaciones) {
          try {
            const categorias = await this.getCategorias(publicacion.ID_publicaciones);
            publicacion.categorias = categorias || [];
          } catch (err) {
            console.error(`Error al obtener categorías para publicación ${publicacion.ID_publicaciones}:`, err);
            publicacion.categorias = [];
          }
        }
      }
      
      console.log(`Recuperadas ${publicaciones.length} publicaciones del administrador ${adminId}`);
      return publicaciones;
    } catch (error) {
      console.error(`Error al obtener publicaciones del administrador ${adminId}:`, error);
      // Devolver array vacío en lugar de lanzar error para evitar el 500
      return [];
    }
  }

}

module.exports = Publicacion;