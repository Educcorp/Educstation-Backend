const { pool } = require('../config/database');

class Usuario {
  // Encontrar un usuario por su ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM Usuarios WHERE ID_usuarios = ?`,
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  // Encontrar un usuario por su nombre de usuario
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM Usuarios WHERE username = ?`,
        [username]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al buscar usuario por nombre de usuario:', error);
      throw error;
    }
  }

  // Encontrar un usuario por su email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM Usuarios WHERE email = ?`,
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  static async create(userData) {
    const { username, email, password, firstName, lastName, role = 'user' } = userData;
    
    try {
      const [result] = await pool.execute(
        `INSERT INTO Usuarios (username, email, password, firstName, lastName, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [username, email, password, firstName, lastName, role]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Actualizar un usuario
  static async update(id, userData) {
    const { username, email, firstName, lastName, role, profileImage } = userData;
    
    try {
      const [result] = await pool.execute(
        `UPDATE Usuarios 
         SET username = ?, email = ?, firstName = ?, lastName = ?, 
             role = ?, profileImage = ?
         WHERE ID_usuarios = ?`,
        [username, email, firstName, lastName, role, profileImage, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar un usuario
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        `DELETE FROM Usuarios WHERE ID_usuarios = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
}

module.exports = Usuario; 