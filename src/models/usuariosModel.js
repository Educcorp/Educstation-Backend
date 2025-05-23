const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  // Encontrar un usuario por su ID
  static async findById(id) {
    try {
      console.log(`Buscando usuario con ID: ${id}`);
      
      // First try to find in auth_user table
      const [authUsers] = await pool.execute(
        'SELECT * FROM auth_user WHERE id = ?',
        [id]
      );
      
      if (authUsers.length > 0) {
        console.log(`Usuario encontrado en auth_user: ${authUsers[0].username}`);
        // Map auth_user fields to match expected format
        const user = {
          ID_usuarios: authUsers[0].id,
          Nickname: authUsers[0].username,
          username: authUsers[0].username,
          Correo_electronico: authUsers[0].email,
          email: authUsers[0].email,
          Nombre_Completo: `${authUsers[0].first_name} ${authUsers[0].last_name}`,
          first_name: authUsers[0].first_name,
          last_name: authUsers[0].last_name
        };
        return user;
      }
      
      // If not found in auth_user, try Usuarios table
      console.log('Usuario no encontrado en auth_user, buscando en tabla Usuarios');
      const [usuarios] = await pool.execute(
        'SELECT * FROM Usuarios WHERE ID_usuarios = ?',
        [id]
      );
      
      if (usuarios.length > 0) {
        console.log(`Usuario encontrado en Usuarios: ${usuarios[0].Nickname}`);
        return usuarios[0];
      }
      
      console.log(`No se encontró usuario con ID ${id} en ninguna tabla`);
      return null;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      throw error;
    }
  }

  // Encontrar un usuario por su nombre de usuario
  static async findByUsername(username) {
    try {
      // First try auth_user table
      const [authUsers] = await pool.execute(
        `SELECT * FROM auth_user WHERE username = ?`,
        [username]
      );
      
      if (authUsers.length > 0) {
        // Map auth_user fields to match expected format
        const user = {
          ID_usuarios: authUsers[0].id,
          Nickname: authUsers[0].username,
          username: authUsers[0].username,
          Correo_electronico: authUsers[0].email,
          email: authUsers[0].email,
          Nombre_Completo: `${authUsers[0].first_name} ${authUsers[0].last_name}`,
          first_name: authUsers[0].first_name,
          last_name: authUsers[0].last_name
        };
        return user;
      }
      
      // If not found, try Usuarios table
      const [usuarios] = await pool.execute(
        `SELECT * FROM Usuarios WHERE Nickname = ?`,
        [username]
      );
      
      return usuarios.length > 0 ? usuarios[0] : null;
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