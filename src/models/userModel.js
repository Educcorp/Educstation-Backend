const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Buscar usuario por email/username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM auth_user WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar usuario por username:', error);
      throw error;
    }
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM auth_user WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar usuario por email:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, first_name, last_name, is_staff, is_superuser, avatar, date_joined FROM auth_user WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  // Crear un nuevo usuario
  static async create(userData) {
    const { username, email, password, first_name, last_name } = userData;
    
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Generar fecha actual en formato MySQL
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    try {
      const [result] = await pool.execute(
        `INSERT INTO auth_user 
        (username, email, password, first_name, last_name, is_staff, is_active, date_joined, is_superuser, avatar) 
        VALUES (?, ?, ?, ?, ?, 0, 1, ?, 0, '/assets/images/logoBN.png')`,
        [username, email, hashedPassword, first_name, last_name, now]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  // Verificar contraseña
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Actualizar contraseña de usuario
  static async updatePassword(userId, newPassword) {
    try {
      // Generar hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      const [result] = await pool.execute(
        'UPDATE auth_user SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }

  // Eliminar usuario por ID
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM auth_user WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Actualizar avatar de usuario
  static async updateAvatar(userId, avatarUrl) {
    try {
      const [result] = await pool.execute(
        'UPDATE auth_user SET avatar = ? WHERE id = ?',
        [avatarUrl, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar avatar:', error);
      throw error;
    }
  }
}

module.exports = User;