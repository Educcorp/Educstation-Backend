const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config/config');

// Función para generar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, is_staff: user.is_staff, is_superuser: user.is_superuser },
    config.jwtSecret,
    { expiresIn: '24h' }
  );
};

// Controlador para registro de usuarios
exports.register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ msg: 'El nombre de usuario ya existe' });
    }

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ msg: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const userId = await User.create({
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName
    });

    // Obtener el usuario recién creado
    const newUser = await User.findById(userId);

    // Generar token
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        is_staff: newUser.is_staff,
        is_superuser: newUser.is_superuser
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Controlador para login de usuarios
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(user);

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
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Controlador para obtener datos del usuario actual
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
    res.status(500).json({ msg: 'Error en el servidor' });
  }
};

// Controlador para actualizar avatar del usuario
exports.updateAvatar = async (req, res) => {
  try {
    const { avatarData } = req.body;
    
    if (!avatarData) {
      return res.status(400).json({ msg: 'No se proporcionaron datos para el avatar' });
    }
    
    const success = await User.updateAvatar(req.user.id, avatarData);
    
    if (!success) {
      return res.status(400).json({ msg: 'No se pudo actualizar el avatar' });
    }
    
    res.json({ msg: 'Avatar actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar avatar:', error);
    res.status(500).json({ msg: 'Error en el servidor' });
  }
}; 