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

  // Buscar categorías que contengan el texto de búsqueda en el nombre
  static async searchByName(searchText) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Categorias WHERE Nombre_categoria LIKE ? ORDER BY Nombre_categoria',
        [`%${searchText}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error al buscar categorías por nombre:', error);
      throw error;
    }
  }

  // Obtener estadísticas de las categorías (número de publicaciones por categoría)
  static async getStats() {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          c.ID_categoria,
          c.Nombre_categoria,
          c.Descripcion,
          COUNT(pc.ID_publicacion) AS publicaciones_count
        FROM 
          Categorias c
        LEFT JOIN 
          Publicaciones_Categorias pc ON c.ID_categoria = pc.ID_categoria
        GROUP BY 
          c.ID_categoria
        ORDER BY 
          publicaciones_count DESC, c.Nombre_categoria ASC
      `);
      return rows;
    } catch (error) {
      console.error('Error al obtener estadísticas de categorías:', error);
      throw error;
    }
  }

  // Obtener todas las categorías
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Categorias ORDER BY Nombre_categoria'
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener categorías:', error);
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
}

module.exports = Categoria;