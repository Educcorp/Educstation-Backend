const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Administrador {
  // Buscar administrador por correo
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM Administrador WHERE Correo_electronico = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar administrador por email:', error);
      throw error;
    }
  }

  // Buscar administrador por ID
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT ID_administrador, Nombre, Correo_electronico FROM Administrador WHERE ID_administrador = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al buscar administrador por ID:', error);
      throw error;
    }
  }

  // Crear un nuevo administrador
  static async create(adminData) {
    const { nombre, email, password } = adminData;
    
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO Administrador (Nombre, Correo_electronico, Contraseña) VALUES (?, ?, ?)',
        [nombre, email, hashedPassword]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error al crear administrador:', error);
      throw error;
    }
  }

  // Verificar contraseña
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
  
  // Obtener todos los administradores
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT ID_administrador, Nombre, Correo_electronico FROM Administrador'
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener administradores:', error);
      throw error;
    }
  }
  
  // Actualizar administrador
  static async update(id, adminData) {
    const { nombre, email } = adminData;
    
    try {
      const [result] = await pool.execute(
        'UPDATE Administrador SET Nombre = ?, Correo_electronico = ? WHERE ID_administrador = ?',
        [nombre, email, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar administrador:', error);
      throw error;
    }
  }
  
  // Cambiar contraseña
  static async updatePassword(id, newPassword) {
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    try {
      const [result] = await pool.execute(
        'UPDATE Administrador SET Contraseña = ? WHERE ID_administrador = ?',
        [hashedPassword, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      throw error;
    }
  }
  
  // Eliminar administrador
  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM Administrador WHERE ID_administrador = ?',
        [id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al eliminar administrador:', error);
      throw error;
    }
  }
}

module.exports = Administrador;