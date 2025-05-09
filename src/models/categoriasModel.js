// src/models/categoriasModel.js - Versión mejorada

const { pool } = require('../config/database');

class Categoria {
  // Buscar categoría por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Categorias WHERE ID_categoria = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar categoría por ID:', error);
      throw error;
    }
  }

  // Buscar categoría por nombre
  static async findByName(nombre) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Categorias WHERE Nombre_categoria = ?',
        [nombre]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar categoría por nombre:', error);
      throw error;
    }
  }

  // Añadir estos nuevos métodos al modelo existente

  // Obtener total de categorías
  static async getTotal() {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as total FROM Categorias'
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener total de categorías:', error);
      throw error;
    }
  }

  // Obtener estadísticas de categorías
  static async getStats() {
    try {
      const [rows] = await pool.execute(
        `SELECT c.ID_categoria, c.Nombre_categoria, 
       COUNT(pc.ID_publicacion) as total_publicaciones
       FROM Categorias c
       LEFT JOIN Publicaciones_Categorias pc ON c.ID_categoria = pc.ID_categoria
       GROUP BY c.ID_categoria
       ORDER BY total_publicaciones DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de categorías:', error);
      throw error;
    }
  }

  // Método para búsqueda avanzada en categorías
  static async search(term, filters = {}) {
    try {
      let query = `
      SELECT c.* 
      FROM Categorias c
      WHERE c.Nombre_categoria LIKE ? OR c.Descripcion LIKE ?
    `;

      const params = [`%${term}%`, `%${term}%`];

      // Ordenamiento
      const orderBy = filters.orderBy || 'Nombre_categoria';
      const orderDir = filters.orderDir === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${orderBy} ${orderDir}`;

      // Paginación
      const limite = filters.limite || 10;
      const offset = filters.offset || 0;
      query += ' LIMIT ? OFFSET ?';
      params.push(limite, offset);

      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Error en búsqueda de categorías:', error);
      throw error;
    }
  }

  // Obtener todas las categorías con conteo de publicaciones
  static async getAllWithPostCount() {
    try {
      const [rows] = await pool.execute(`
        SELECT c.*, COUNT(pc.ID_publicacion) as post_count
        FROM Categorias c
        LEFT JOIN Publicaciones_Categorias pc ON c.ID_categoria = pc.ID_categoria
        LEFT JOIN Publicaciones p ON pc.ID_publicacion = p.ID_publicaciones AND p.Estado = 'publicado'
        GROUP BY c.ID_categoria
        ORDER BY c.Nombre_categoria
      `);
      return rows;
    } catch (error) {
      console.error('Error al obtener categorías con conteo:', error);
      throw error;
    }
  }

  // Crear una nueva categoría
  static async create(categoriaData) {
    const { nombre, descripcion } = categoriaData;

    try {
      const [result] = await pool.execute(
        'INSERT INTO Categorias (Nombre_categoria, Descripcion) VALUES (?, ?)',
        [nombre, descripcion]
      );

      return result.insertId;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  }

  // Actualizar categoría
  static async update(id, categoriaData) {
    const { nombre, descripcion } = categoriaData;

    try {
      const [result] = await pool.execute(
        'UPDATE Categorias SET Nombre_categoria = ?, Descripcion = ? WHERE ID_categoria = ?',
        [nombre, descripcion, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      throw error;
    }
  }

  // Eliminar categoría
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Categorias WHERE ID_categoria = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  }

  // Obtener publicaciones por categoría
  static async getPublicaciones(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.* 
         FROM Publicaciones p
         JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
         WHERE pc.ID_categoria = ? AND p.Estado = 'publicado'
         ORDER BY p.Fecha_creacion DESC`,
        [id]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener publicaciones por categoría:', error);
      throw error;
    }
  }

  // Obtener publicaciones paginadas por categoría
  static async getPublicacionesPaginated(id, limit, offset) {
    try {
      const [rows] = await pool.execute(
        `SELECT p.*, a.Nombre as NombreAdmin 
         FROM Publicaciones p
         JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
         JOIN Administrador a ON p.ID_administrador = a.ID_administrador
         WHERE pc.ID_categoria = ? AND p.Estado = 'publicado'
         ORDER BY p.Fecha_creacion DESC
         LIMIT ? OFFSET ?`,
        [id, limit, offset]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener publicaciones paginadas:', error);
      throw error;
    }
  }

  // Contar total de publicaciones por categoría
  static async countPublicaciones(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as total
         FROM Publicaciones p
         JOIN Publicaciones_Categorias pc ON p.ID_publicaciones = pc.ID_publicacion
         WHERE pc.ID_categoria = ? AND p.Estado = 'publicado'`,
        [id]
      );
      return rows[0].total;
    } catch (error) {
      console.error('Error al contar publicaciones:', error);
      throw error;
    }
  }

  // Obtener total de categorías
  static async getTotal() {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as total FROM Categorias'
      );
      return rows[0].total;
    } catch (error) {
      console.error('Error al obtener total de categorías:', error);
      throw error;
    }
  }

  // Buscar categorías por término
  static async search(term, orderBy = 'Nombre_categoria', orderDir = 'ASC', limit = 10, offset = 0) {
    try {
      // Validar campos para prevenir SQL injection
      const validOrderFields = ['Nombre_categoria', 'ID_categoria'];
      const safeOrderBy = validOrderFields.includes(orderBy) ? orderBy : 'Nombre_categoria';
      const safeOrderDir = ['ASC', 'DESC'].includes(orderDir) ? orderDir : 'ASC';

      const query = `
      SELECT c.*
      FROM Categorias c
      WHERE c.Nombre_categoria LIKE ? OR c.Descripcion LIKE ?
      ORDER BY c.${safeOrderBy} ${safeOrderDir}
      LIMIT ? OFFSET ?
    `;

      const [rows] = await pool.execute(
        query,
        [`%${term}%`, `%${term}%`, limit, offset]
      );

      return rows;
    } catch (error) {
      console.error('Error al buscar categorías:', error);
      throw error;
    }
  }

  // Contar resultados de búsqueda
  static async countSearchResults(term) {
    try {
      const [rows] = await pool.execute(
        `SELECT COUNT(*) as total
       FROM Categorias
       WHERE Nombre_categoria LIKE ? OR Descripcion LIKE ?`,
        [`%${term}%`, `%${term}%`]
      );

      return rows[0].total;
    } catch (error) {
      console.error('Error al contar resultados de búsqueda:', error);
      throw error;
    }
  }

}

module.exports = Categoria;