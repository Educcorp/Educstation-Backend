const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Administrador {
  // Buscar administrador por ID de usuario
  static async findByUserId(userId) {
    try {
      console.log(`Buscando administrador para userId: ${userId}`);
      
      if (!userId) {
        console.error('Error: userId es undefined o null');
        return null;
      }
      
      // Primero verificamos si el usuario es superusuario
      const [userRows] = await pool.execute(
        'SELECT * FROM auth_user WHERE id = ? AND is_superuser = 1',
        [userId]
      );
      
      console.log(`Resultado de la consulta auth_user: ${userRows.length} filas`);
      
      if (!userRows[0]) {
        console.log(`Usuario ${userId} no es superusuario`);
        return null; // No es superusuario
      }
      
      console.log(`Usuario ${userId} es superusuario, email: ${userRows[0].email}`);
      
      // Buscamos si ya existe un registro en la tabla Administrador
      const [adminRows] = await pool.execute(
        'SELECT * FROM Administrador WHERE Correo_electronico = ?',
        [userRows[0].email]
      );
      
      console.log(`Resultado de la consulta Administrador: ${adminRows.length} filas`);
      
      if (adminRows[0]) {
        console.log(`Administrador encontrado con ID: ${adminRows[0].ID_administrador}`);
        return {
          ...adminRows[0],
          auth_user_id: userRows[0].id
        };
      }
      
      console.log(`No se encontró administrador para ${userRows[0].email}, creando uno nuevo`);
      
      // Si no existe, creamos un nuevo registro en la tabla Administrador
      const [result] = await pool.execute(
        'INSERT INTO Administrador (Nombre, Correo_electronico, Contraseña) VALUES (?, ?, ?)',
        [
          `${userRows[0].first_name} ${userRows[0].last_name}`,
          userRows[0].email,
          userRows[0].password // Usamos la misma contraseña hasheada
        ]
      );
      
      console.log(`Nuevo administrador creado con ID: ${result.insertId}`);
      
      return {
        ID_administrador: result.insertId,
        Nombre: `${userRows[0].first_name} ${userRows[0].last_name}`,
        Correo_electronico: userRows[0].email,
        auth_user_id: userRows[0].id
      };
    } catch (error) {
      console.error('Error al buscar/crear administrador:', error);
      return null; // Devolver null en lugar de lanzar error
    }
  }

  // Verificar si un usuario es administrador
  static async isAdmin(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT is_superuser FROM auth_user WHERE id = ?',
        [userId]
      );
      
      return rows[0] && rows[0].is_superuser === 1;
    } catch (error) {
      console.error('Error al verificar si es administrador:', error);
      throw error;
    }
  }

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