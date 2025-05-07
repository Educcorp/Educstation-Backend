const User = require('../models/userModel');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');
const { validationResult } = require('express-validator');

// Registro de usuario
const register = async (req, res) => {
  try {
    // Validar errores
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, password2, first_name, last_name } = req.body;

    // Verificar si las contraseñas coinciden
    if (password !== password2) {
      return res.status(400).json({ detail: "Las contraseñas no coinciden." });
    }

    // Verificar si el email ya existe
    const existingEmail = await User.findByUsername(email);
    if (existingEmail) {
      return res.status(400).json({ detail: "El correo ya está registrado" });
    }

    // Crear usuario
    const userId = await User.create({ 
      username, 
      email, 
      password, 
      first_name, 
      last_name 
    });

    // Obtener datos del usuario creado
    const user = await User.findById(userId);
    
    // Responder con status 201 (Created) y datos básicos del usuario
    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (error) {
    console.error('Error en registro:', error);
    // Mejorar manejo de errores con mensajes específicos
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ detail: 'El nombre de usuario o correo ya está en uso' });
    }
    res.status(500).json({ detail: 'Error en el servidor: ' + error.message });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ detail: 'Credenciales inválidas' });
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
      refresh: refreshToken
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
      is_admin: user.is_staff === 1
    });
  } catch (error) {
    console.error('Error al obtener detalles del usuario:', error);
    res.status(500).json({ detail: 'Error en el servidor' });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getUserDetails
};