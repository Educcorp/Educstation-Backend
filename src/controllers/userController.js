const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Registrar usuario
exports.registerUser = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, first_name, last_name } = req.body;

    // Verificar si el usuario ya existe
    const existingUserByEmail = await User.findByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ msg: 'El correo electrónico ya está registrado' });
    }

    const existingUserByUsername = await User.findByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ msg: 'El nombre de usuario ya está en uso' });
    }

    // Crear usuario
    const userId = await User.create({
      username,
      email,
      password,
      first_name,
      last_name,
    });

    // Crear JWT
    const payload = {
      user: {
        id: userId,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// Iniciar sesión
exports.loginUser = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Buscar usuario por nombre de usuario
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Crear JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_staff: user.is_staff,
            is_superuser: user.is_superuser,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// Obtener información del usuario actual
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
};

// Actualizar avatar del usuario
exports.updateAvatar = async (req, res) => {
  try {
    const { avatarData } = req.body;
    
    if (!avatarData) {
      return res.status(400).json({ msg: 'Datos de avatar no proporcionados' });
    }
    
    const userId = req.user.id;
    const success = await User.updateAvatar(userId, avatarData);
    
    if (!success) {
      return res.status(404).json({ msg: 'Usuario no encontrado o avatar no actualizado' });
    }
    
    res.json({ msg: 'Avatar actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    res.status(500).json({ msg: 'Error del servidor' });
  }
}; 