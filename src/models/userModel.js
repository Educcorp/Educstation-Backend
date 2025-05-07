const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Buscar usuario por email/username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM auth_user WHERE username = ? OR email = ?',
        [username, username]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      throw error;
    }
  }

  // Buscar usuario por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, first_name, last_name, is_staff FROM auth_user WHERE id = ?',
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
        (username, email, password, first_name, last_name, is_staff, is_active, date_joined, is_superuser) 
        VALUES (?, ?, ?, ?, ?, 0, 1, ?, 0)`,
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
}

module.exports = User;