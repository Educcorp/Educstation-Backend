const User = require('../models/userModel');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { sendPasswordResetEmail } = require('../utils/emailUtils');

// Registro de usuario
const register = async (req, res) => {
  try {
    console.log('Recibida solicitud de registro:', {
      username: req.body.username,
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name
    });

    // Validar errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, password2, first_name, last_name } = req.body;

    // Verificar si las contraseñas coinciden
    if (password !== password2) {
      console.log('Error: Las contraseñas no coinciden');
      return res.status(400).json({ detail: "Las contraseñas no coinciden." });
    }

    // Verificar si el usuario ya existe por nombre de usuario
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      console.log('Error: Nombre de usuario ya existe:', username);
      return res.status(400).json({ detail: "El nombre de usuario ya está en uso" });
    }

    // Verificar si el usuario ya existe por email
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      console.log('Error: Email ya existe:', email);
      return res.status(400).json({ detail: "El correo electrónico ya está registrado" });
    }

    // Crear usuario
    console.log('Creando usuario...');
    const userId = await User.create({
      username,
      email,
      password,
      first_name,
      last_name
    });

    // Obtener datos del usuario creado
    const user = await User.findById(userId);
    console.log('Usuario creado con éxito, ID:', userId);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (error) {
    console.error('Error en registro:', error);

    // Errores específicos de la base de datos
    if (error.code === 'ER_DUP_ENTRY') {
      const errorMessage = error.message || '';
      if (errorMessage.includes('email')) {
        return res.status(400).json({ detail: 'El email ya está registrado' });
      } else if (errorMessage.includes('username')) {
        return res.status(400).json({ detail: 'El nombre de usuario ya está en uso' });
      }
      return res.status(400).json({ detail: 'El email o nombre de usuario ya está registrado' });
    }

    // Otros errores del servidor
    res.status(500).json({ detail: 'Error en el servidor al procesar el registro' });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario por username o email
    let user = await User.findByUsername(username);

    // Si no encontró por username, intenta buscar por email
    if (!user) {
      user = await User.findByEmail(username);
      if (!user) {
        return res.status(401).json({ detail: 'Credenciales inválidas' });
      }
    }

    // Verificar contraseña
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ detail: 'Credenciales inválidas' });
    }

    // Generar tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      access: accessToken,
      refresh: refreshToken,
      username: user.username,
      is_superuser: user.is_superuser === 1
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Renovar token de acceso
const refreshToken = async (req, res) => {
  try {
    const { refresh } = req.body;

    if (!refresh) {
      return res.status(400).json({ detail: 'Se requiere token de refresco' });
    }

    const decoded = verifyRefreshToken(refresh);
    if (!decoded) {
      return res.status(403).json({ detail: 'Token de refresco inválido o expirado' });
    }

    // Verificar que el usuario existe
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(403).json({ detail: 'Usuario no encontrado' });
    }

    // Generar nuevos tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      access: accessToken,
      refresh: refreshToken
    });
  } catch (error) {
    console.error('Error al refrescar token:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Obtener datos del usuario actual
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_admin: user.is_staff === 1,
      is_superuser: user.is_superuser === 1
    });
  } catch (error) {
    console.error('Error al obtener detalles del usuario:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Validar disponibilidad de nombre de usuario
const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ detail: 'Se requiere un nombre de usuario' });
    }

    // Validar formato de nombre de usuario antes de buscar en la base de datos
    if (!/^[a-z0-9_.-]{3,}$/.test(username)) {
      return res.json({
        available: false,
        message: 'Nombre de usuario inválido. Use solo letras minúsculas, números, punto y guion bajo (mínimo 3 caracteres)'
      });
    }

    const existingUser = await User.findByUsername(username);

    res.json({
      available: !existingUser,
      message: existingUser ? 'El nombre de usuario ya está en uso' : 'El nombre de usuario está disponible'
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad de usuario:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Validar disponibilidad de correo electrónico
const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ detail: 'Se requiere un correo electrónico' });
    }

    // Validar formato de correo electrónico
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.json({
        available: false,
        message: 'Formato de correo electrónico inválido'
      });
    }

    const existingUser = await User.findByEmail(email);

    res.json({
      available: !existingUser,
      message: existingUser ? 'El correo electrónico ya está registrado' : 'El correo electrónico está disponible'
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad de correo electrónico:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Solicitar restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ detail: 'Se requiere un correo electrónico' });
    }

    // Buscar usuario por email
    const user = await User.findByEmail(email);

    if (!user) {
      // Cambiamos para devolver un error específico cuando el correo no existe
      return res.status(404).json({
        detail: 'No existe ninguna cuenta con este correo electrónico. Por favor, verifica que has introducido el correo correcto.'
      });
    }

    // Generar token JWT con expiración de 1 hora
    const resetToken = jwt.sign(
      { userId: user.id, action: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Normalizar la URL base para evitar doble slash
    let baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // Eliminar la barra final si existe
    baseUrl = baseUrl.replace(/\/$/, '');

    // Crear URL de restablecimiento (frontend)
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    console.log('URL de restablecimiento generada:', resetUrl);

    // Preparar información de respuesta
    const responseData = {
      detail: 'Se ha enviado un correo con las instrucciones para restablecer tu contraseña.',
      // En desarrollo, proporcionamos información adicional para pruebas
      ...(process.env.NODE_ENV !== 'production' && {
        debug_info: {
          token: resetToken,
          reset_url: resetUrl,
          note: 'Esta información solo se muestra en modo desarrollo'
        }
      })
    };

    try {
      // Intentar enviar el correo (real o simulado)
      await sendPasswordResetEmail(
        email,
        user.first_name,
        resetUrl
      );
    } catch (emailError) {
      // Si falla el envío de correo, registramos el error pero no interrumpimos el flujo
      console.error('Error al enviar correo de restablecimiento:', emailError);

      // Añadir información sobre el error de envío en desarrollo
      if (process.env.NODE_ENV !== 'production') {
        responseData.email_error = {
          message: 'Hubo un problema al enviar el correo, pero el token se generó correctamente.',
          error: emailError.message
        };
      }
    }

    // Devolver respuesta exitosa incluso si falló el envío de correo
    // El usuario podrá usar el token en desarrollo, y en producción se mostrará el mensaje genérico
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Restablecer contraseña con token
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    console.log('Solicitud de restablecimiento de contraseña recibida:', {
      tokenLength: token ? token.length : 'no proporcionado',
      passwordLength: password ? password.length : 'no proporcionada'
    });

    if (!token || !password) {
      return res.status(400).json({
        detail: 'Se requiere un token válido y una nueva contraseña'
      });
    }

    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verificado correctamente, datos decodificados:', {
        userId: decoded.userId,
        action: decoded.action,
        exp: decoded.exp,
        iat: decoded.iat
      });

      // Verificar que sea un token de restablecimiento de contraseña
      if (decoded.action !== 'password_reset') {
        console.log('Token con acción incorrecta:', decoded.action);
        throw new Error('Token inválido, acción incorrecta');
      }
    } catch (error) {
      console.error('Error al verificar token:', error.message);
      return res.status(400).json({
        detail: 'El token es inválido o ha expirado. Solicita un nuevo enlace de restablecimiento.'
      });
    }

    // Buscar al usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error('Usuario no encontrado con ID:', decoded.userId);
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', {
      id: user.id,
      username: user.username,
      email: user.email
    });

    // Actualizar la contraseña en la base de datos
    console.log('Intentando actualizar contraseña para usuario ID:', user.id);
    const updated = await User.updatePassword(decoded.userId, password);

    if (!updated) {
      console.error('No se pudo actualizar la contraseña, no se modificaron filas');
      return res.status(500).json({
        detail: 'No se pudo actualizar la contraseña. Contacte al administrador.'
      });
    }

    console.log('Contraseña actualizada exitosamente para usuario ID:', user.id);

    res.status(200).json({
      detail: 'Contraseña restablecida con éxito. Ahora puedes iniciar sesión con tu nueva contraseña.'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

// Eliminar cuenta del usuario autenticado
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ detail: 'No autenticado' });
    }
    const deleted = await User.delete(userId);
    if (deleted) {
      return res.status(200).json({ detail: 'Cuenta eliminada correctamente' });
    } else {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({ detail: 'Error al eliminar la cuenta' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getUserDetails,
  checkUsernameAvailability,
  checkEmailAvailability,
  requestPasswordReset,
  resetPassword,
  deleteAccount
};