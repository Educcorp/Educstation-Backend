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
        'SELECT id, username, email, first_name, last_name, is_staff, is_superuser, avatar FROM auth_user WHERE id = ?',
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

  // Actualizar avatar del usuario
  static async updateAvatar(userId, avatarData) {
    try {
      // Verificar parámetros para evitar undefined
      if (userId === undefined || userId === null) {
        throw new Error('ID de usuario no proporcionado');
      }

      if (avatarData === undefined) {
        console.error('Error: avatarData es undefined');
        throw new Error('Datos de avatar no proporcionados');
      }

      // Usar null explícitamente si avatarData está vacío pero no es undefined
      const finalAvatarData = (avatarData === '') ? null : avatarData;
      
      // Verificar el tamaño de los datos
      const dataSize = finalAvatarData ? finalAvatarData.length : 0;
      console.log(`Tamaño de los datos del avatar: ${Math.round(dataSize/1024)} KB`);
      
      // Si los datos son demasiado grandes, rechazar
      if (dataSize > 10 * 1024 * 1024) { // 10MB límite
        console.error('Error: Avatar demasiado grande', { size: dataSize });
        throw new Error('El avatar es demasiado grande. Máximo 10MB.');
      }

      const [result] = await pool.execute(
        'UPDATE auth_user SET avatar = ? WHERE id = ?',
        [finalAvatarData, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      // Registrar detalles específicos del error
      console.error('Error al actualizar avatar:', error);
      console.error('Detalles del error:', {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        message: error.message
      });
      
      // Si es un error de MySQL, proporcionar información más específica
      if (error.code === 'ER_DATA_TOO_LONG') {
        throw new Error('El avatar es demasiado grande para la columna de la base de datos');
      } else if (error.code === 'ER_NET_PACKET_TOO_LARGE') {
        throw new Error('El paquete de datos es demasiado grande para MySQL');
      }
      
      throw error;
    }
  }
}

module.exports = User;